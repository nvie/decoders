import { Decoder } from '../Decoder';

/**
 * Accepts and returns `Date` instances.
 */
export const date: Decoder<Date>;

/**
 * Accepts [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)-formatted strings,
 * returns them as `Date` instances.
 *
 * This is very useful for working with dates in APIs: serialize them as
 * `.toISOString()` when sending, decode them with `iso8601` when receiving.
 */
export const iso8601: Decoder<Date>;
