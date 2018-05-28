// @flow strict

import { annotate } from 'debrief';
import { Err, Ok } from 'lemons';

import type { Decoder, anything } from './types';

/**
 * Decoder that only returns Ok for `null` inputs.  Err otherwise.
 */
export const null_: Decoder<null> = (blob: anything) =>
    blob === null ? Ok(blob) : Err(annotate(blob, 'Must be null'));

/**
 * Decoder that only returns Ok for `undefined` inputs.  Err otherwise.
 */
export const undefined_: Decoder<void> = (blob: anything) =>
    blob === undefined ? Ok(blob) : Err(annotate(blob, 'Must be undefined'));

/**
 * Decoder that only returns Ok for the given value constant.  Err otherwise.
 */
export function constant<T>(value: T): Decoder<T> {
    return (blob: anything) => (blob === value ? Ok(blob) : Err(annotate(blob, `Must be constant ${String(value)}`)));
}

/**
 * Decoder that always returns Ok for the given hardcoded value, no matter what the input.
 */
export function hardcoded<T>(value: T): Decoder<T> {
    return (_: anything) => Ok(value);
}

/**
 * Decoder that always returns Ok for the given hardcoded value, no matter what the input.
 */
export const mixed: Decoder<mixed> = (blob: anything) => Ok((blob: mixed));
