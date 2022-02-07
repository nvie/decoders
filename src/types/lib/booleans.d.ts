import { Decoder } from '../Decoder';

/**
 * Accepts and returns booleans.
 */
export const boolean: Decoder<boolean>;

/**
 * Accepts anything and will return its "truth" value. Will never reject.
 */
export const truthy: Decoder<boolean>;

/**
 * Accepts numbers, but return their boolean representation.
 */
export const numericBoolean: Decoder<boolean>;
