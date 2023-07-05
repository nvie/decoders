import { define } from '../Decoder';
import { indent, summarize } from '../_utils';
import { object } from './objects';
import { prep } from './utilities';
import type { Decoder, DecoderType, DecodeResult, Scalar } from '../Decoder';
import type { Ok } from '../result';

type Values<T extends object> = T[keyof T];

type DecoderTypes<T> = T extends readonly Decoder<infer U>[] ? U : never;

const EITHER_PREFIX = 'Either:\n';

/**
 * Indents and adds a dash in front of this (potentially multiline) string.
 */
function itemize(s: string): string {
    return `-${indent(s).substring(1)}`;
}

/**
 * Nests another error as an item under a new-to-be-created "Either error". If
 * the given subitem already is an "Either error" of itself, don't indent, but
 * just "inject" its items at the same error level, for nicely flattened either
 * expressions.
 *
 * Avoids:
 *
 *     Either:
 *     - Either:
 *       - Must be P
 *       - Either:
 *         - Must be Q
 *         - Must be R
 *     - Must be S
 *
 * And "flattens" these to:
 *
 *     Either:
 *     - Must be P
 *     - Must be Q
 *     - Must be R
 *     - Must be S
 *
 */
function nest(errText: string): string {
    return errText.startsWith(EITHER_PREFIX)
        ? errText.substr(EITHER_PREFIX.length)
        : itemize(errText);
}

/**
 * Accepts values accepted by any of the given decoders.
 *
 * The decoders are tried on the input one by one, in the given order. The
 * first one that accepts the input "wins". If all decoders reject the input,
 * the input gets rejected.
 */
export function either<T extends readonly Decoder<any>[]>(
    ...decoders: T
): Decoder<DecoderTypes<T>> {
    if (decoders.length === 0) {
        throw new Error('Pass at least one decoder to either()');
    }

    return define((blob, _, err) => {
        // Collect errors here along the way
        const errors = [];

        for (let i = 0; i < decoders.length; i++) {
            const result: DecodeResult<unknown> = decoders[i].decode(blob);
            if (result.ok) {
                return result as Ok<DecoderTypes<T>>;
            } else {
                errors.push(result.error);
            }
        }

        // Decoding all alternatives failed, return the combined error message
        const text =
            EITHER_PREFIX +
            errors.map((err) => nest(summarize(err).join('\n'))).join('\n');
        return err(text);
    });
}

/**
 * Accepts any value that is strictly-equal (using `===`) to one of the
 * specified values.
 */
export function oneOf<C extends Scalar>(constants: readonly C[]): Decoder<C> {
    return define((blob, ok, err) => {
        const winner = constants.find((c) => c === blob);
        if (winner !== undefined) {
            return ok(winner);
        }
        return err(
            `Must be one of ${constants
                .map((value) => JSON.stringify(value))
                .join(', ')}`,
        );
    });
}

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
): Decoder<Values<{ [key in keyof O]: DecoderType<O[key]> }>> {
    const base: Decoder<string> = object({
        [field]: prep(String, oneOf(Object.keys(mapping))),
    }).transform((o) => o[field]);
    return base.peek_UNSTABLE(([blob, key]) => {
        const decoder = mapping[key];
        return decoder.decode(blob);
    });
}
