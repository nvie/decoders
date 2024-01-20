import type { Decoder, DecoderType } from '~/core';
import { define, summarize } from '~/core';
import { indent } from '~/lib/text';
import type { Scalar } from '~/lib/types';
import { isNumber, isString } from '~/lib/utils';

import { prep } from './misc';
import { object } from './objects';

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
    ? errText.substring(EITHER_PREFIX.length)
    : itemize(errText);
}

/**
 * Accepts values accepted by any of the given decoders.
 *
 * The decoders are tried on the input one by one, in the given order. The
 * first one that accepts the input "wins". If all decoders reject the input,
 * the input gets rejected.
 */
export function either<TDecoders extends readonly Decoder<unknown>[]>(
  ...decoders: TDecoders
): Decoder<DecoderType<TDecoders[number]>> {
  if (decoders.length === 0) {
    throw new Error('Pass at least one decoder to either()');
  }

  type T = DecoderType<TDecoders[number]>;
  return define<T>((blob, _, err) => {
    // Collect errors here along the way
    const errors = [];

    for (let i = 0; i < decoders.length; i++) {
      const result = (decoders[i] as Decoder<T>).decode(blob);
      if (result.ok) {
        return result;
      } else {
        errors.push(result.error);
      }
    }

    // Decoding all alternatives failed, return the combined error message
    const text =
      EITHER_PREFIX + errors.map((err) => nest(summarize(err).join('\n'))).join('\n');
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
      `Must be one of ${constants.map((value) => JSON.stringify(value)).join(', ')}`,
    );
  });
}

/**
 * Accepts and return an enum value.
 */
export function enum_<TEnum extends Record<string, string | number>>(
  enumObj: TEnum,
): Decoder<TEnum[keyof TEnum]> {
  const values = Object.values(enumObj);
  if (!values.some(isNumber)) {
    return oneOf(values) as Decoder<TEnum[keyof TEnum]>;
  } else {
    // Numeric enums (or mixed enums) require a bit more work. We'll definitely
    // want to allow all the numeric values.
    const nums = values.filter(isNumber);
    const ignore = new Set(nums.map((val) => enumObj[val]));

    // But don't keep the string values that are the key names for the
    // numeric values we already covered
    const strings = values.filter(isString).filter((val) => !ignore.has(val));

    return oneOf([...nums, ...strings]) as Decoder<TEnum[keyof TEnum]>;
  }
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
export function taggedUnion<
  O extends Record<string, Decoder<unknown>>,
  T = DecoderType<O[keyof O]>,
>(field: string, mapping: O): Decoder<T> {
  const scout = object({
    [field]: prep(String, oneOf(Object.keys(mapping))),
  }).transform((o) => o[field]);
  return select(
    scout, // peek...
    (key) => mapping[key] as Decoder<T>, // ...then select
  );
}

/**
 * Briefly peek at a runtime input using a "scout" decoder first, then decide
 * which decoder to run on the (original) input, based on the information that
 * the "scout" extracted.
 *
 * It serves a similar purpose as `taggedUnion()`, but is a generalization that
 * works even if there isn't a single discriminator, or the discriminator isn't
 * a string.
 */
export function select<T, D extends Decoder<unknown>>(
  scout: Decoder<T>,
  selectFn: (result: T) => D,
): Decoder<DecoderType<D>> {
  return define((blob) => {
    const result = scout.decode(blob);
    return result.ok ? selectFn(result.value).decode(blob) : result;
  }) as Decoder<DecoderType<D>>;
}
