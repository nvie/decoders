import type { Decoder } from '~/core';
import { define } from '~/core';
import { isBigInt, isNumber } from '~/lib/utils';

/**
 * Accepts any valid ``number`` value.
 *
 * This also accepts special values like `NaN` and `Infinity`. Unless you
 * want to deliberately accept those, you'll likely want to use the
 * `number` decoder instead.
 */
export const anyNumber: Decoder<number> = define((blob, ok, err) =>
  isNumber(blob) ? ok(blob) : err('Must be number'),
);

/**
 * Accepts finite numbers (can be integer or float values). Values `NaN`,
 * or positive and negative `Infinity` will get rejected.
 */
export const number: Decoder<number> = anyNumber.refine(
  (n) => Number.isFinite(n),
  'Number must be finite',
);

/**
 * Accepts only finite whole numbers.
 */
export const integer: Decoder<number> = number.refine(
  (n) => Number.isInteger(n),
  'Number must be an integer',
);

/**
 * Accepts only non-negative (zero or positive) finite numbers.
 */
export const positiveNumber: Decoder<number> = number.refine(
  (n) => n >= 0 && !Object.is(n, -0),
  'Number must be positive',
);

/**
 * Accepts only non-negative (zero or positive) finite whole numbers.
 */
export const positiveInteger: Decoder<number> = integer.refine(
  (n) => n >= 0 && !Object.is(n, -0),
  'Number must be positive',
);

/**
 * Accepts numbers greater than or equal to the given minimum.
 * Defaults to the ``number`` decoder if none is provided. Pass a
 * different decoder to further restrict accepted values, e.g. ``min(0, integer)``.
 */
export function min(min: number, decoder: Decoder<number> = number): Decoder<number> {
  return decoder.reject((value) => (value < min ? `Must be at least ${min}` : null));
}

/**
 * Accepts numbers less than or equal to the given maximum.
 * Defaults to the ``number`` decoder if none is provided. Pass a
 * different decoder to further restrict accepted values, e.g. ``max(100, integer)``.
 */
export function max(max: number, decoder: Decoder<number> = number): Decoder<number> {
  return decoder.reject((value) => (value > max ? `Must be at most ${max}` : null));
}

/**
 * Accepts numbers within the given range (bounds are inclusive).
 * Defaults to the ``number`` decoder if none is provided. Pass a
 * different decoder to further restrict accepted values, e.g. ``between(1, 10, integer)``.
 */
export function between(
  min: number,
  max: number,
  decoder: Decoder<number> = number,
): Decoder<number> {
  return decoder.reject((value) =>
    value < min
      ? `Must be at least ${min}`
      : value > max
        ? `Must be at most ${max}`
        : null,
  );
}

/**
 * Accepts any valid ``bigint`` value.
 */
export const bigint: Decoder<bigint> = define((blob, ok, err) =>
  isBigInt(blob) ? ok(blob) : err('Must be bigint'),
);
