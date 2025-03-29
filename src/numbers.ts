import type { ReadonlyDecoder } from '~/core';
import { defineReadonly } from '~/core';
import { isBigInt, isNumber } from '~/lib/utils';

/**
 * Accepts any valid ``number`` value.
 *
 * This also accepts special values like `NaN` and `Infinity`. Unless you
 * want to deliberately accept those, you'll likely want to use the
 * `number` decoder instead.
 */
export const anyNumber: ReadonlyDecoder<number> = defineReadonly(
  isNumber,
  'Must be number',
);

/**
 * Accepts finite numbers (can be integer or float values). Values `NaN`,
 * or positive and negative `Infinity` will get rejected.
 */
export const number: ReadonlyDecoder<number> = anyNumber.refine(
  (n) => Number.isFinite(n),
  'Number must be finite',
);

/**
 * Accepts only finite whole numbers.
 */
export const integer: ReadonlyDecoder<number> = number.refine(
  (n) => Number.isInteger(n),
  'Number must be an integer',
);

/**
 * Accepts only non-negative (zero or positive) finite numbers.
 */
export const positiveNumber: ReadonlyDecoder<number> = number.refine(
  (n) => n >= 0 && !Object.is(n, -0),
  'Number must be positive',
);

/**
 * Accepts only non-negative (zero or positive) finite whole numbers.
 */
export const positiveInteger: ReadonlyDecoder<number> = integer.refine(
  (n) => n >= 0 && !Object.is(n, -0),
  'Number must be positive',
);

/**
 * Accepts any valid ``bigint`` value.
 */
export const bigint: ReadonlyDecoder<bigint> = defineReadonly(isBigInt, 'Must be bigint');
