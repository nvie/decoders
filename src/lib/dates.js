// @flow strict

import { annotate } from '../annotate';
import { define } from '../_decoder';
import { err, ok } from '../result';
import { isDate } from '../_utils';
import { regex } from './strings';
import type { Decoder } from '../_decoder';

// $FlowFixMe[unclear-type] (not really an issue) - deliberate casting
type cast = any;

// Only matches the shape.  This "over-matches" some values that still aren't
// valid dates (like 9999-99-99), but those will be caught by JS Date's
// internal validations
const iso8601_re =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:[.]\d+)?(?:Z|[+-]\d{2}:?\d{2})$/;

/**
 * Accepts and returns
 * [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
 * instances.
 */
export const date: Decoder<Date> = define((blob) =>
    isDate(blob) ? ok(((blob: cast): Date)) : err(annotate(blob, 'Must be a Date')),
);

/**
 * Decoder that only returns Ok for strings that are valid ISO8601 date
 * strings.  Err otherwise.
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
