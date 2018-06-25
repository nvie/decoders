// @flow strict

import { annotate } from 'debrief';
import { Err, Ok } from 'lemons';

import { either } from './either';
import type { Decoder, anything } from './types';

/**
 * Decoder that only returns Ok for `null` or `undefined` inputs.
 * This is equivalent to either(null_, undefined_), but combines their error
 * message output into a single line.
 */
export const undefined_or_null: Decoder<null | void> = (blob: anything) =>
    blob === undefined || blob === null
        ? Ok(blob)
        : // Combine error message into a single line
          Err(annotate(blob, 'Must be undefined or null'));

/**
 * Decoder that only returns Ok for `null` or `undefined` inputs.
 */
export function maybe<T>(decoder: Decoder<T>): Decoder<?T> {
    return either(undefined_or_null, decoder);
}
