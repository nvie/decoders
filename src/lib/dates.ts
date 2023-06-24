// @flow strict

import { asDate } from '../_utils';
import { define } from '../Decoder';
import { regex } from './strings';
import type { Decoder } from '../Decoder';

// Only matches the shape.  This "over-matches" some values that still aren't
// valid dates (like 9999-99-99), but those will be caught by JS Date's
// internal validations
const iso8601_re =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:[.]\d+)?(?:Z|[+-]\d{2}:?\d{2})$/;

/**
 * Accepts and returns `Date` instances.
 */
export const date: Decoder<Date> = define((blob, ok, err) => {
    const date = asDate(blob);
    return date !== null ? ok(date) : err('Must be a Date');
});

/**
 * Accepts [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)-formatted strings,
 * returns them as `Date` instances.
 *
 * This is very useful for working with dates in APIs: serialize them as
 * `.toISOString()` when sending, decode them with `iso8601` when receiving.
 */
export const iso8601: Decoder<Date> =
    // Input itself needs to match the ISO8601 regex...
    regex(iso8601_re, 'Must be ISO8601 format').transform(
        // Make sure it is a _valid_ date
        (value: string) => {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                throw new Error('Must be valid date/time value');
            }
            return date;
        },
    );
