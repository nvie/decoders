// @flow strict

import { andThen, err, ok } from './result';
import { annotate } from './annotate';
import { formatInline } from './format';
import type { Annotation } from './annotate';
import type { Result } from './result';

export type Scalar = string | number | boolean | symbol | void | null;

export type DecodeResult<T> = Result<T, Annotation>;
export type DecodeFn<T, I = mixed> = (
    blob: I,
    accept: (value: T) => DecodeResult<T>,
    reject: (msg: string | Annotation) => DecodeResult<T>,
) => DecodeResult<T>;

/**
 * Helper type to return the "type" of a Decoder.
 *
 * You can use it on types:
 *
 *   DecoderType<Decoder<string>>       // => string
 *   DecoderType<Decoder<number[]>>     // => number[]
 *
 * Or on "values", by using the `typeof` keyword:
 *
 *   DecoderType<typeof array(string)>  // => string[]
 *   DecoderType<typeof truthy>         // => boolean
 *
 */
export type DecoderType<D> = $Call<<T>(Decoder<T>) => T, D>;

export type Decoder<T> = {|
    +decode: (blob: mixed) => DecodeResult<T>,
    +verify: (blob: mixed, formatterFn?: (Annotation) => string) => T,
    +and: (predicateFn: (value: T) => boolean, message: string) => Decoder<T>,
    +transform: <V>(transformFn: (value: T) => V) => Decoder<V>,
    +describe: (message: string) => Decoder<T>,
    +chain: <V>(nextDecodeFn: DecodeFn<V, T>) => Decoder<V>,
|};

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
export function define<T>(decodeFn: DecodeFn<T>): Decoder<T> {
    const decode = (blob: mixed) =>
        decodeFn(blob, ok, (msg: Annotation | string) =>
            err(typeof msg === 'string' ? annotate(blob, msg) : msg),
        );

    return Object.freeze({
        decode,

        verify(blob: mixed, formatter: (Annotation) => string = formatInline): T {
            const result = decode(blob);
            if (result.ok) {
                return result.value;
            } else {
                const err = new Error('\n' + formatter(result.error));
                err.name = 'Decoding error';
                throw err;
            }
        },

        and(predicateFn: (value: T) => boolean, message: string): Decoder<T> {
            return define((blob, accept, reject) =>
                andThen(decode(blob), (value) =>
                    predicateFn(value) ? accept(value) : reject(annotate(value, message)),
                ),
            );
        },

        /**
         * Accepts any value the given decoder accepts, and on success, will
         * call the transformation function **with the decoded result**. If the
         * transformation function throws an error, the whole decoder will fail
         * using the error message as the failure reason.
         */
        transform<V>(transformFn: (T) => V): Decoder<V> {
            return define((blob, accept, reject): DecodeResult<V> =>
                andThen(decode(blob), (value) => {
                    try {
                        return accept(transformFn(value));
                    } catch (e) {
                        return reject(
                            annotate(value, e instanceof Error ? e.message : String(e)),
                        );
                    }
                }),
            );
        },

        describe(message: string): Decoder<T> {
            return define((blob, _, reject) => {
                // Decode using the given decoder...
                const result = decode(blob);
                if (result.ok) {
                    return result;
                } else {
                    // ...but in case of error, annotate this with the custom given
                    // message instead
                    return reject(annotate(result.error, message));
                }
            });
        },

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
        chain<V>(nextDecodeFn: DecodeFn<V, T>): Decoder<V> {
            return define((blob, accept, reject) =>
                andThen(decode(blob), (value) => nextDecodeFn(value, accept, reject)),
            );
        },
    });
}
