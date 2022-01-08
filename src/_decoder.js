// @flow strict

import { formatInline } from './format';
import type { Annotation } from './annotate';
import type { Result } from './result';

export type Scalar = string | number | boolean | symbol | void | null;

export type Predicate<T> = (T) => boolean;

export type DecodeResult<T> = Result<T, Annotation>;

export type Decoder<T, F = mixed> = {|
    +decode: (blob: F) => DecodeResult<T>,
    +verify: (blob: F, formatterFn?: (Annotation) => string) => T,
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
export function define<T, F = mixed>(fn: (F) => DecodeResult<T>): Decoder<T, F> {
    return Object.freeze({
        decode(blob: F): DecodeResult<T> {
            return fn(blob);
        },

        verify(blob: F, formatter: (Annotation) => string = formatInline): T {
            const result = fn(blob);
            if (result.ok) {
                return result.value;
            } else {
                const err = new Error('\n' + formatter(result.error));
                err.name = 'Decoding error';
                throw err;
            }
        },
    });
}

/**
 * A "type function" which informs Flow about how a type will be modified at runtime.
 * Read this as "given a Guard of type T, I can produce a value of type T".  This
 * definition helps construct $ObjMap types.
 */
export type DecoderType = <T>(Decoder<T>) => T;
