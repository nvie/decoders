import { Annotation } from './annotate';
import { Result } from './result';

export type Scalar = string | number | boolean | symbol | undefined | null;

export type DecodeResult<T> = Result<T, Annotation>;

export type AcceptanceFn<T, InputT = unknown> = (
    blob: InputT,
    ok: (value: T) => DecodeResult<T>,
    err: (msg: string | Annotation) => DecodeResult<T>,
) => DecodeResult<T>;

export interface Decoder<T> {
    /**
     * Verifies untrusted input. Either returns a value, or throws a decoding
     * error.
     */
    verify(blob: unknown, formatterFn?: (ann: Annotation) => string | Error): T;

    /**
     * Verifies untrusted input. Either returns a value, or returns undefined.
     */
    value(blob: unknown): T | undefined;

    /**
     * Verifies untrusted input. Always returns a DecodeResult, which is either
     * an "ok" value or an "error" annotation.
     */
    decode(blob: unknown): DecodeResult<T>;

    /**
     * Build a new decoder from the the current one, with an extra acceptance
     * criterium.
     */
    refine<N extends T>(predicate: (value: T) => value is N, msg: string): Decoder<N>;
    refine(predicate: (value: T) => boolean, msg: string): Decoder<T>;

    /**
     * Build a new decoder from the current one, with an extra rejection
     * criterium.
     */
    reject(rejectFn: (value: T) => string | Annotation | null): Decoder<T>;

    /**
     * Build a new decoder from the current one, modifying its outputted value.
     */
    transform<V>(transformFn: (value: T) => V): Decoder<V>;

    /**
     * Build a new decoder from the current one, with a mutated error message
     * in case of a rejection.
     */
    describe(message: string): Decoder<T>;

    /**
     * Chain together the current decoder with another acceptance function.
     */
    then<V>(next: AcceptanceFn<V, T>): Decoder<V>;

    // Experimental APIs (please don't rely on these yet)
    peek_UNSTABLE<V>(next: AcceptanceFn<V, [unknown, T]>): Decoder<V>;
}

/**
 * Helper type to return the "type" of a Decoder.
 *
 * You can use it on types:
 *
 *   DecoderType<Decoder<string>>    // string
 *   DecoderType<Decoder<number[]>>  // number[]
 *
 * Or on "values", by using the `typeof` keyword:
 *
 *   DecoderType<typeof string>      // string
 *   DecoderType<typeof truthy>      // boolean
 *
 */
export type DecoderType<T> = T extends Decoder<infer V> ? V : never;

/**
 * Defines a new `Decoder<T>`, by implementing a custom acceptance function.
 * The function receives three arguments:
 *
 * 1. `blob` - the raw/unknown input (aka your external data)
 * 2. `ok` - Call `ok(value)` to accept the input and return ``value``
 * 3. `err` - Call `err(message)` to reject the input with error ``message``
 *
 * The expected return value should be a `DecodeResult<T>`, which can be
 * obtained by returning the result of calling the provided `ok` or `err`
 * helper functions. Please note that `ok()` and `err()` don't perform side
 * effects! You'll need to _return_ those values.
 */
export function define<T>(fn: AcceptanceFn<T>): Decoder<T>;
