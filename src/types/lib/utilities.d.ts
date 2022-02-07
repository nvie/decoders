import { Decoder } from '../Decoder';

/**
 * Accepts any value that is an ``instanceof`` the given class.
 */
export function instanceOf<T>(klass: new (...args: readonly any[]) => T): Decoder<T>;

/**
 * Lazily evaluate the given decoder. This is useful to build self-referential
 * types for recursive data structures.
 */
export function lazy<T>(decoderFn: () => Decoder<T>): Decoder<T>;

/**
 * Pre-process the data input before passing it into the decoder. This gives
 * you the ability to arbitrarily customize the input on the fly before passing
 * it to the decoder. Of course, the input value at that point is still of
 * ``unknown`` type, so you will have to deal with that accordingly.
 */
export function prep<T>(
    mapperFn: (blob: unknown) => unknown,
    decoder: Decoder<T>,
): Decoder<T>;

/**
 * Rejects all inputs, and always fails with the given error message. May be
 * useful for explicitly disallowing keys, or for testing purposes.
 */
export function never(msg: string): Decoder<never>;

/**
 * Alias of never().
 */
export function fail(msg: string): Decoder<never>;
