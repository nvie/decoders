// @flow strict

import { andThen, err, ok } from './result';
import { annotate } from './annotate';
import { formatInline } from './format';
import type { Annotation } from './annotate';
import type { Result } from './result';

export type Scalar = string | number | boolean | symbol | void | null;

export type Predicate<T> = (T) => boolean;

export type DecodeResult<T> = Result<T, Annotation>;

export type Decoder<T, F = mixed> = {|
    +decode: (blob: F) => DecodeResult<T>,
    +verify: (blob: F, formatterFn?: (Annotation) => string) => T,
    +transform: <V>(transformFn: (value: T) => V) => Decoder<V, F>,
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
export function define<T, F = mixed>(fn: (F) => DecodeResult<T>): Decoder<T, F> {
    function decode(blob: F): DecodeResult<T> {
        return fn(blob);
    }

    return Object.freeze({
        decode,

        verify(blob: F, formatter: (Annotation) => string = formatInline): T {
            const result = decode(blob);
            if (result.ok) {
                return result.value;
            } else {
                const err = new Error('\n' + formatter(result.error));
                err.name = 'Decoding error';
                throw err;
            }
        },

        /**
         * Accepts any value the given decoder accepts, and on success, will
         * call the mapper value **on the decoded result**. If the mapper
         * function throws an error, the whole decoder will fail using the
         * error message as the failure reason.
         */
        transform<V>(transformFn: (T) => V): Decoder<V, F> {
            return define((blob: F): DecodeResult<V> => {
                const result = decode(blob);
                const mapper = neverThrow(transformFn);
                return andThen(result, mapper);
            });
        },
    });
}

/**
 * A "type function" which informs Flow about how a type will be modified at runtime.
 * Read this as "given a Guard of type T, I can produce a value of type T".  This
 * definition helps construct $ObjMap types.
 */
export type DecoderType = <T>(Decoder<T>) => T;
