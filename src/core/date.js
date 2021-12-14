// @flow strict

import { annotate } from '../annotate';
import { err, ok } from '../result';
import { isDate } from '../_utils';
import { map } from './composition';
import { regex } from './string';
import type { Decoder } from '../_types';

// $FlowFixMe[unclear-type] (not really an issue) - deliberate casting
type cast = any;

// Only matches the shape.  This "over-matches" some values that still aren't
// valid dates (like 9999-99-99), but those will be caught by JS Date's
// internal validations
const iso8601_re =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:[.]\d+)?(?:Z|[+-]\d{2}:?\d{2})$/;

export const date: Decoder<Date> = (value: mixed) =>
    isDate(value) ? ok(((value: cast): Date)) : err(annotate(value, 'Must be a Date'));

/**
 * Decoder that only returns Ok for strings that are valid ISO8601 date
 * strings.  Err otherwise.
 */
export const iso8601: Decoder<Date> = map(
    // Input itself needs to match the ISO8601 regex...
    regex(iso8601_re, 'Must be ISO8601 format'),

    // Make sure it is a _valid_ date
    (value: string) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new Error('Must be valid date/time value');
        }
        return date;
    },
);
