import type { Decoder, ReadonlyCallableDecoder, ReadonlyDecoder } from '~/core';
import { callable, defineReadonly } from '~/core';
import type { RangeOptions } from '~/lib/options';
import { byRangeOptions } from '~/lib/options';
import { isBigInt, isNumber, isSignNegative, isSignPositive } from '~/lib/utils';

export function ranged(
  decoder: ReadonlyDecoder<number>,
  options: RangeOptions,
): ReadonlyDecoder<number>;
export function ranged(decoder: Decoder<number>, options: RangeOptions): Decoder<number>;
/* #__NO_SIDE_EFFECTS__ */
export function ranged(decoder: Decoder<number>, options: RangeOptions): Decoder<number> {
  return decoder.reject(byRangeOptions(options));
}

/**
 * Accepts any valid ``number`` value.
 *
 * This also accepts special values like `NaN` and `Infinity`, and unsafe
 * integers (beyond ±(2^53-1)). Unless you want to deliberately accept those,
 * you'll likely want to use the `number` or `integer` decoder instead.
 */
export const anyNumber: ReadonlyDecoder<number> = defineReadonly(
  isNumber,
  'Must be number',
);

/**
 * Accepts only finite numbers (e.g. -3.14, 0, 1, 42, ...).
 * Integers or floats, but not `NaN` or `Infinity`.
 */
export const number: ReadonlyCallableDecoder<number, RangeOptions> =
  /* #__PURE__ */ callable(
    /* #__PURE__ */ anyNumber.refine((n) => Number.isFinite(n), 'Number must be finite'),
    ranged,
  );

/**
 * Accepts only integers (e.g. ..., -2, -1, 0, 1, 2, ...).
 * Whole numbers, and safe (between -(2^53-1) and 2^53-1).
 */
export const integer: ReadonlyCallableDecoder<number, RangeOptions> =
  /* #__PURE__ */ callable(
    /* #__PURE__ */ anyNumber.reject((n) =>
      Number.isSafeInteger(n)
        ? null
        : !Number.isFinite(n)
          ? 'Number must be finite'
          : !Number.isInteger(n)
            ? 'Number must be an integer'
            : 'Number must be a safe integer',
    ),
    ranged,
  );

/**
 * Accepts only non-negative numbers (e.g. 0, 0.5, 1, 3.14, ...).
 * Integers or floats, >= 0, and finite.
 */
export const nonNegativeNumber: ReadonlyCallableDecoder<number, RangeOptions> =
  /* #__PURE__ */ callable(
    /* #__PURE__ */ anyNumber.reject((n) =>
      Number.isFinite(n) && isSignPositive(n)
        ? null
        : isSignNegative(n)
          ? 'Number must be positive'
          : 'Number must be finite',
    ),
    ranged,
  );

/**
 * Accepts only the natural numbers (e.g. 0, 1, 2, 3, ...).
 * Whole numbers, >= 0, and safe (up to 2^53-1).
 */
export const natural: ReadonlyCallableDecoder<number, RangeOptions> =
  /* #__PURE__ */ callable(
    /* #__PURE__ */ anyNumber.reject((n) =>
      Number.isSafeInteger(n) && isSignPositive(n)
        ? null
        : isSignNegative(n)
          ? 'Number must be positive'
          : !Number.isFinite(n)
            ? 'Number must be finite'
            : !Number.isInteger(n)
              ? 'Number must be an integer'
              : 'Number must be a safe integer',
    ),
    ranged,
  );

/** @deprecated Renamed to `nonNegativeNumber`. */
export const positiveNumber: ReadonlyCallableDecoder<number, RangeOptions> =
  nonNegativeNumber;
/** @deprecated Renamed to `natural`. */
export const positiveInteger: ReadonlyCallableDecoder<number, RangeOptions> = natural;

/**
 * @deprecated Use `number({ min })`, or e.g. `integer({ min })`.
 */
/* #__NO_SIDE_EFFECTS__ */
export function min(min: number, decoder: Decoder<number> = number): Decoder<number> {
  return ranged(decoder, { min });
}

/**
 * @deprecated Use `number({ max })`, or e.g. `integer({ max })`.
 */
/* #__NO_SIDE_EFFECTS__ */
export function max(max: number, decoder: Decoder<number> = number): Decoder<number> {
  return ranged(decoder, { max });
}

/**
 * @deprecated Use `number({ min, max })`, or e.g. `integer({ min, max })`.
 */
/* #__NO_SIDE_EFFECTS__ */
export function between(
  min: number,
  max: number,
  decoder: Decoder<number> = number,
): Decoder<number> {
  return ranged(decoder, { min, max });
}

/**
 * Accepts any valid ``bigint`` value.
 */
export const bigint: ReadonlyDecoder<bigint> = defineReadonly(isBigInt, 'Must be bigint');
