import { Decoder } from '../Decoder';

/**
 * Accepts any valid ``number`` value.
 *
 * This also accepts special values like `NaN` and `Infinity`. Unless you
 * want to deliberately accept those, you'll likely want to use the
 * `number` decoder instead.
 */
export const anyNumber: Decoder<number>;

/**
 * Accepts finite numbers (can be integer or float values). Values `NaN`,
 * or positive and negative `Infinity` will get rejected.
 */
export const number: Decoder<number>;

/**
 * Accepts only finite whole numbers.
 */
export const integer: Decoder<number>;

/**
 * Accepts only positive finite numbers.
 */
export const positiveNumber: Decoder<number>;

/**
 * Accepts only positive finite whole numbers.
 */
export const positiveInteger: Decoder<number>;
