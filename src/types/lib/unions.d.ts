import { Decoder, DecoderType, Scalar } from '../Decoder';

export type Values<T extends object> = T[keyof T];

export type DecoderTypes<T> = T extends ReadonlyArray<Decoder<infer U>> ? U : never;

/**
 * Accepts values accepted by any of the given decoders.
 *
 * The decoders are tried on the input one by one, in the given order. The
 * first one that accepts the input "wins". If all decoders reject the input,
 * the input gets rejected.
 */
export function either<T extends ReadonlyArray<Decoder<any>>>(
    ...args: T
): Decoder<DecoderTypes<T>>;

/**
 * Accepts any value that is strictly-equal (using `===`) to one of the
 * specified values.
 */
export function oneOf<T extends Scalar>(constants: readonly T[]): Decoder<T>;

/**
 * If you are decoding tagged unions you may want to use the `taggedUnion()`
 * decoder instead of the general purpose `either()` decoder to get better
 * error messages and better performance.
 *
 * This decoder is optimized for [tagged
 * unions](https://en.wikipedia.org/wiki/Tagged_union), i.e. a union of
 * objects where one field is used as the discriminator.
 *
 * ```ts
 * const A = object({ tag: constant('A'), foo: string });
 * const B = object({ tag: constant('B'), bar: number });
 *
 * const AorB = taggedUnion('tag', { A, B });
 * //                        ^^^
 * ```
 *
 * Decoding now works in two steps:
 *
 * 1. Look at the `'tag'` field in the incoming object (this is the field
 *    that decides which decoder will be used)
 * 2. If the value is `'A'`, then decoder `A` will be used. If it's `'B'`, then
 *    decoder `B` will be used. Otherwise, this will fail.
 *
 * This is effectively equivalent to `either(A, B)`, but will provide better
 * error messages and is more performant at runtime because it doesn't have to
 * try all decoders one by one.
 */
export function taggedUnion<O extends Record<string, Decoder<any>>>(
    field: string,
    mapping: O,
): Decoder<Values<{ [key in keyof O]: DecoderType<O[key]> }>>;
