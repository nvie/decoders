// @flow strict

import { annotate } from 'debrief';
import { Err, Ok } from 'lemons';

import { number } from './number';
import type { Decoder, anything } from './types';
import { map } from './utils';

/**
 * Decoder that only returns Ok for boolean inputs.  Err otherwise.
 */
export const boolean: Decoder<boolean> = (blob: anything) => {
    return typeof blob === 'boolean' ? Ok(blob) : Err(annotate(blob, 'Must be boolean'));
};

/**
 * Decoder that returns true for all truthy values, and false otherwise.  Never fails.
 */
export const truthy: Decoder<boolean> = (blob: anything) => {
    return Ok(!!blob);
};

/**
 * Decoder that only returns Ok for numeric input values representing booleans.
 * Returns their boolean representation.  Err otherwise.
 */
export const numericBoolean: Decoder<boolean> = map(number, n => !!n);
