import type { Decoder } from '~/core';
import { define } from '~/core';
import { isDate } from '~/lib/utils';

import { regex } from './strings';
import { either } from './unions';

// Only matches the shape. This "over-matches" some values that still aren't
// valid dates (like 9999-99-99), but those will be caught by JS Date's
// internal validations
const iso8601_re =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:[.]\d+)?(?:Z|[+-]\d{2}:?\d{2})$/;

/**
 * Accepts and returns `Date` instances.
 */
export const date: Decoder<Date> = define((blob, ok, err) => {
  return isDate(blob) ? ok(blob) : err('Must be a Date');
});

/**
 * Accepts and returns [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)-formatted strings.
 */
export const dateString: Decoder<string> = regex(
  iso8601_re,
  'Must be ISO8601 format',
).refine(
  (value: string) => !Number.isNaN(new Date(value).getTime()),
  'Must be valid date/time value',
);

/**
 * Accepts [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)-formatted strings,
 * returns them as `Date` instances.
 *
 * This is very useful for working with dates in APIs: serialize them as
 * `.toISOString()` when sending, decode them with `iso8601` when receiving.
 */
export const iso8601: Decoder<Date> = dateString.transform((value) => new Date(value));

/**
 * Accepts either a Date, or an ISO date string, returns a Date instance.
 * This is commonly useful to build decoders that can be reused to validate
 * object with Date instances as well as objects coming from JSON payloads.
 */
export const datelike = either(date, iso8601).describe('Must be a Date or date string');
