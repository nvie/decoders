// @flow strict

import { annotate } from './annotate';
import { err, ok } from './result';
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
    decode(blob: mixed): DecodeResult<T>,
    verify(blob: mixed, formatterFn?: (Annotation) => string): T,
    refine(predicateFn: (value: T) => boolean, errmsg: string): Decoder<T>,
    reject(rejectFn: (value: T) => string | Annotation | null): Decoder<T>,
    transform<V>(transformFn: (value: T) => V): Decoder<V>,
    describe(message: string): Decoder<T>,
    then<V>(next: DecodeFn<V, T>): Decoder<V>,

    // Experimental APIs (please don't rely on these yet)
    peek_UNSTABLE<V>(next: DecodeFn<V, [mixed, T]>): Decoder<V>,
|};

function andThen<A, B, E>(
    r: Result<A, E>,
    callback: (value: A) => Result<B, E>,
): Result<B, E> {
    return r.ok ? callback(r.value) : r;
}

function noThrow<T, V>(fn: (value: T) => V): (T) => DecodeResult<V> {
    return (t) => {
        try {
            const v = fn(t);
            return ok(v);
        } catch (e) {
            return err(annotate(t, e instanceof Error ? e.message : String(e)));
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
export function define<T>(decodeFn: DecodeFn<T>): Decoder<T> {
    /**
     * Validates the raw/untrusted/unknown input and either accepts or rejects
     * it.
     *
     * Contrasted with `.verify()`, calls to `.decode()` will never fail and
     * instead return a result type.
     */
    const decode = (blob: mixed) =>
        decodeFn(blob, ok, (msg: Annotation | string) =>
            err(typeof msg === 'string' ? annotate(blob, msg) : msg),
        );

    /**
     * Verified the (raw/untrusted/unknown) input and either accepts or rejects
     * it. When accepted, returns the decoded `T` value directly. Otherwise
     * fail with a runtime error.
     */
    const verify = (blob: mixed, formatter: (Annotation) => string = formatInline): T => {
        const result = decode(blob);
        if (result.ok) {
            return result.value;
        } else {
            const err = new Error('\n' + formatter(result.error));
            err.name = 'Decoding error';
            throw err;
        }
    };

    /**
     * Accepts any value the given decoder accepts, and on success, will call
     * the given function **on the decoded result**. If the transformation
     * function throws an error, the whole decoder will fail using the error
     * message as the failure reason.
     */
    const transform = <V>(transformFn: (T) => V): Decoder<V> => {
        return then(noThrow(transformFn));
    };

    /**
     * Adds an extra predicate to a decoder. The new decoder is like the
     * original decoder, but only accepts values that also meet the
     * predicate.
     */
    const refine = (predicateFn: (value: T) => boolean, errmsg: string): Decoder<T> => {
        return reject((value) =>
            predicateFn(value)
                ? // Don't reject
                  null
                : // Reject with the given error message
                  errmsg,
        );
    };

    /**
     * Chain together the current decoder with another.
     *
     * First, the current decoder must accept the input. If so, it will pass
     * the successfully decoded result to the given ``next`` function to
     * further decide whether or not the value should get accepted or rejected.
     *
     * The argument to `.then()` is a decoding function, just like one you
     * would pass to `define()`. The key difference with `define()` is that
     * `define()` must always assume an ``unknown`` input, whereas with
     * a `.then()` call the provided ``next`` function will receive a ``T`` as
     * its input. This will allow the function to make a stronger assumption
     * about its input.
     *
     * If it helps, you can think of `define(nextFn)` as equivalent to
     * `unknown.then(nextFn)`.
     *
     * This is an advanced, low-level, decoder. It's not recommended to reach
     * for this low-level construct when implementing custom decoders. Most
     * cases can be covered by `.transform()` or `.refine()`.
     */
    const then = <V>(next: DecodeFn<V, T>): Decoder<V> =>
        define((blob, accV, rejV) => andThen(decode(blob), (t) => next(t, accV, rejV)));

    /**
     * Adds an extra predicate to a decoder. The new decoder is like the
     * original decoder, but only accepts values that aren't rejected by the
     * given function.
     *
     * The given function can return `null` to accept the decoded value, or
     * return a specific error message to reject.
     *
     * Unlike `.refine()`, you can use this function to return a dynamic error
     * message.
     */
    const reject = (rejectFn: (value: T) => string | Annotation | null): Decoder<T> => {
        return then((value, accT, rejT) => {
            const errmsg = rejectFn(value);
            return errmsg === null
                ? accT(value)
                : rejT(typeof errmsg === 'string' ? annotate(value, errmsg) : errmsg);
        });
    };

    /**
     * Uses the given decoder, but will use an alternative error message in
     * case it rejects. This can be used to simplify or shorten otherwise
     * long or low-level/technical errors.
     */
    const describe = (message: string): Decoder<T> => {
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
    };

    return Object.freeze({
        verify,
        decode,
        transform,
        refine,
        reject,
        describe,
        then,

        /**
         * WARNING: This is an EXPERIMENTAL API that will likely change in the
         * future. Please DO NOT rely on it.
         *
         * Chain together the current decoder with another, but also pass along
         * the original input.
         *
         * This is like `.then()`, but instead of this function receiving just
         * the decoded result ``T``, it also receives the original input.
         *
         * This is an advanced, low-level, decoder.
         */
        peek_UNSTABLE<V>(next: DecodeFn<V, [mixed, T]>): Decoder<V> {
            return define((blob, accV, rejV) =>
                andThen(decode(blob), (t) => next([blob, t], accV, rejV)),
            );
        },
    });
}
