// @flow strict

import * as Result from '../result';
import { annotate } from '../annotate';
import { map } from './composition';
import { number } from './number';
import type { Decoder } from '../_types';

/**
 * Decoder that only returns Ok for boolean inputs.  Err otherwise.
 */
export const boolean: Decoder<boolean> = (blob: mixed) => {
    return typeof blob === 'boolean'
        ? Result.ok(blob)
        : Result.err(annotate(blob, 'Must be boolean'));
};

/**
 * Decoder that returns true for all truthy values, and false otherwise.  Never fails.
 */
export const truthy: Decoder<boolean> = (blob: mixed) => {
    return Result.ok(!!blob);
};

/**
 * Decoder that only returns Ok for numeric input values representing booleans.
 * Returns their boolean representation.  Err otherwise.
 */
export const numericBoolean: Decoder<boolean> = map(number, (n) => !!n);
