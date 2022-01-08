// @flow strict

import { andThen, err, ok } from './result';
import { annotate } from './annotate';
import { formatInline } from './format';
import type { Annotation } from './annotate';
import type { Result } from './result';

export type Scalar = string | number | boolean | symbol | void | null;

export type Predicate<T> = (T) => boolean;

export type DecodeResult<T> = Result<T, Annotation>;

export type Decoder<T> = {|
    +decode: (blob: mixed) => DecodeResult<T>,
    +verify: (blob: mixed, formatterFn?: (Annotation) => string) => T,
    +and: (predicateFn: (value: T) => boolean, message: string) => Decoder<T>,
    +transform: <V>(transformFn: (value: T) => V) => Decoder<V>,
    +describe: (message: string) => Decoder<T>,
    +chain: <V>(nextDecodeFn: (T) => DecodeResult<V>) => Decoder<V>,
|};

function neverThrow<T, V>(transformFn: (T) => V): (T) => DecodeResult<V> {
    return (value: T) => {
        try {
            return ok(transformFn(value));
        } catch (e) {
            return err(annotate(value, e instanceof Error ? e.message : String(e)));
        }
    };
}

function makeVerify<T>(
    decodeFn: (mixed) => DecodeResult<T>,
): (blob: mixed, formatterFn?: (Annotation) => string) => T {
    return (blob: mixed, formatter: (Annotation) => string = formatInline): T => {
        const result = decodeFn(blob);
        if (result.ok) {
            return result.value;
        } else {
            const err = new Error('\n' + formatter(result.error));
            err.name = 'Decoding error';
            throw err;
        }
    };
}

function makeDescribe<T>(
    decodeFn: (mixed) => DecodeResult<T>,
): (message: string) => Decoder<T> {
    return (message: string): Decoder<T> =>
        define((blob) => {
            // Decode using the given decoder...
            const result = decodeFn(blob);
            if (result.ok) {
                return result;
            } else {
                // ...but in case of error, annotate this with the custom given
                // message instead
                return err(annotate(result.error, message));
            }
        });
}

function makeAnd<T>(
    decodeFn: (mixed) => DecodeResult<T>,
): (predicateFn: (value: T) => boolean, message: string) => Decoder<T> {
    return (predicateFn: (value: T) => boolean, message: string): Decoder<T> =>
        define((blob) =>
            andThen(decodeFn(blob), (value) =>
                predicateFn(value) ? ok(value) : err(annotate(value, message)),
            ),
        );
}

/**
 * Compose two decoders by passing the result of the first into the second.
 * The second decoder may assume as its input type the output type of the first
 * decoder (so it's not necessary to accept the typical "mixed").  This is
 * useful for "narrowing down" the checks.  For example, if you want to write
 * a decoder for positive numbers, you can compose it from an existing decoder
 * for any number, and a decoder that, assuming a number, checks if it's
 * positive.  Very often combined with the predicate() helper as the second
 * argument.
 */
function makeChain<T, V>(
    decodeFn: (mixed) => DecodeResult<T>,
): (nextDecodeFn: (T) => DecodeResult<V>) => Decoder<V> {
    return (nextDecodeFn: (T) => DecodeResult<V>): Decoder<V> => {
        return define((blob) => andThen(decodeFn(blob), nextDecodeFn));
    };
}

/**
 * Build a Decoder<T> using the given decoding function. A valid decoding
 * function meets the following requirements:
 *
 * 1. The function has no side-effects
 * 2. The function takes exactly one argument (of `unknown` type) aka it could
 *    receive anything
 * 3. The function returns either:
 *    a. An "ok" Result (with a value payload of type T)
 *    b. An "err" Result (an annotated representation of the runtime input)
 *
 */
export function define<T>(decodeFn: (mixed) => DecodeResult<T>): Decoder<T> {
    return Object.freeze({
        decode: decodeFn,
        verify: makeVerify(decodeFn),

        and: makeAnd(decodeFn),

        /**
         * Accepts any value the given decoder accepts, and on success, will
         * call the transformation function **with the decoded result**. If the
         * transformation function throws an error, the whole decoder will fail
         * using the error message as the failure reason.
         */
        transform<V>(transformFn: (T) => V): Decoder<V> {
            return define((blob: mixed): DecodeResult<V> =>
                andThen(decodeFn(blob), neverThrow(transformFn)),
            );
        },

        describe: makeDescribe(decodeFn),

        chain: makeChain(decodeFn),
    });
}

/**
 * A "type function" which informs Flow about how a type will be modified at runtime.
 * Read this as "given a Guard of type T, I can produce a value of type T".  This
 * definition helps construct $ObjMap types.
 */
export type DecoderType = <T>(Decoder<T>) => T;
