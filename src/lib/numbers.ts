// @flow strict

import { define } from '../Decoder';
import type { Decoder } from '../Decoder';

/**
 * Accepts any valid ``number`` value.
 *
 * This also accepts special values like `NaN` and `Infinity`. Unless you
 * want to deliberately accept those, you'll likely want to use the
 * `number` decoder instead.
 */
export const anyNumber: Decoder<number> = define((blob, ok, err) =>
    typeof blob === 'number' ? ok(blob) : err('Must be number'),
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
 * Accepts only positive finite numbers.
 */
export const positiveNumber: Decoder<number> = number.refine(
    (n) => n >= 0,
    'Number must be positive',
);

/**
 * Accepts only positive finite whole numbers.
 */
export const positiveInteger: Decoder<number> = integer.refine(
    (n) => n >= 0,
    'Number must be positive',
);
