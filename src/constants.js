// @flow strict

import { annotate } from 'debrief';
import { Err, Ok } from 'lemons/Result';

import type { Decoder, Scalar } from './types';

/**
 * Decoder that only returns Ok for `null` inputs.  Err otherwise.
 */
export const null_: Decoder<null> = (blob: mixed) =>
    blob === null ? Ok(blob) : Err(annotate(blob, 'Must be null'));

/**
 * Decoder that only returns Ok for `undefined` inputs.  Err otherwise.
 */
export const undefined_: Decoder<void> = (blob: mixed) =>
    blob === undefined ? Ok(blob) : Err(annotate(blob, 'Must be undefined'));

/**
 * Decoder that only returns Ok for the given value constant.  Err otherwise.
 */
export function constant<T: Scalar>(value: T): Decoder<T> {
    return (blob: mixed) =>
        blob === value
            ? Ok(value)
            : Err(annotate(blob, `Must be constant ${String(value)}`));
}

/**
 * Decoder that always returns Ok for the given hardcoded value, no matter what the input.
 */
export function hardcoded<T>(value: T): Decoder<T> {
    return (_: mixed) => Ok(value);
}

/**
 * Decoder that always returns Ok for the given hardcoded value, no matter what the input.
 */
export const mixed: Decoder<mixed> = (blob: mixed) => Ok((blob: mixed));

/**
 * Alias of mixed.
 */
export const unknown = mixed;
