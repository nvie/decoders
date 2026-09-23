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
 * Accepts only finite numbers (e.g. -3.14, 0, 1, 42, ...).
 * Integers or floats, but not `NaN` or `Infinity`.
 */
export const number: Decoder<number> = /* #__PURE__ */ anyNumber.refine(
  (n) => Number.isFinite(n),
  'Number must be finite',
);

/**
 * Accepts only integers (e.g. ..., -2, -1, 0, 1, 2, ...).
 * Whole numbers, and finite.
 */
export const integer: Decoder<number> = /* #__PURE__ */ number.refine(
  (n) => Number.isInteger(n),
  'Number must be an integer',
);

/**
 * Accepts only non-negative numbers (e.g. 0, 0.5, 1, 3.14, ...).
 * Integers or floats, >= 0, and finite.
 */
export const nonNegativeNumber: Decoder<number> = /* #__PURE__ */ number.refine(
  (n) => n >= 0 && !Object.is(n, -0),
  'Number must be positive',
);

/**
 * Accepts only the natural numbers (e.g. 0, 1, 2, 3, ...).
 * Whole numbers, >= 0, and finite.
 */
export const natural: Decoder<number> = /* #__PURE__ */ integer.refine(
  (n) => n >= 0 && !Object.is(n, -0),
  'Number must be positive',
);

/** @deprecated Renamed to `nonNegativeNumber`. */
export const positiveNumber: Decoder<number> = nonNegativeNumber;
/** @deprecated Renamed to `natural`. */
export const positiveInteger: Decoder<number> = natural;

/**
 * Accepts numbers greater than or equal to the given minimum.
 * Defaults to the ``number`` decoder if none is provided. Pass a
 * different decoder to further restrict accepted values, e.g. ``min(0, integer)``.
 */
/* #__NO_SIDE_EFFECTS__ */
export function min(min: number, decoder: Decoder<number> = number): Decoder<number> {
  return decoder.reject((value) =>
    value < min ? `Too low, must be at least ${min}` : null,
  );
}

/**
 * Accepts numbers less than or equal to the given maximum.
 * Defaults to the ``number`` decoder if none is provided. Pass a
 * different decoder to further restrict accepted values, e.g. ``max(100, integer)``.
 */
/* #__NO_SIDE_EFFECTS__ */
export function max(max: number, decoder: Decoder<number> = number): Decoder<number> {
  return decoder.reject((value) =>
    value > max ? `Too high, must be at most ${max}` : null,
  );
}

/**
 * Accepts numbers within the given range (bounds are inclusive).
 * Defaults to the ``number`` decoder if none is provided. Pass a
 * different decoder to further restrict accepted values, e.g. ``between(1, 10, integer)``.
 */
/* #__NO_SIDE_EFFECTS__ */
export function between(
  min: number,
  max: number,
  decoder: Decoder<number> = number,
): Decoder<number> {
  return decoder.reject((value) =>
    value < min
      ? `Too low, must be between ${min} and ${max}`
      : value > max
        ? `Too high, must be between ${min} and ${max}`
        : null,
  );
}

/**
 * Accepts any valid ``bigint`` value.
 */
export const bigint: Decoder<bigint> = define((blob, ok, err) =>
  isBigInt(blob) ? ok(blob) : err('Must be bigint'),
);
