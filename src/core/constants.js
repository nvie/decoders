// @flow strict

import { annotate } from '../annotate';
import { err, ok } from '../result';
import type { Decoder, Scalar } from '../_types';

/**
 * Decoder that only returns Ok for `null` inputs.  Err otherwise.
 */
export const null_: Decoder<null> = (blob: mixed) =>
    blob === null ? ok(blob) : err(annotate(blob, 'Must be null'));

/**
 * Decoder that only returns Ok for `undefined` inputs.  Err otherwise.
 */
export const undefined_: Decoder<void> = (blob: mixed) =>
    blob === undefined ? ok(blob) : err(annotate(blob, 'Must be undefined'));

/**
 * Decoder that only returns Ok for the given value constant.  Err otherwise.
 */
export function constant<T: Scalar>(value: T): Decoder<T> {
    return (blob: mixed) =>
        blob === value
            ? ok(value)
            : err(annotate(blob, `Must be constant ${String(value)}`));
}

/**
 * Decoder that always returns Ok for the given hardcoded value, no matter what the input.
 */
export function hardcoded<T>(value: T): Decoder<T> {
    return () => ok(value);
}

/**
 * Decoder that always returns Ok for the given hardcoded value, no matter what the input.
 */
export const unknown: Decoder<mixed> = (blob: mixed) => ok(blob);

/**
 * Alias of unknown.
 */
export const mixed: Decoder<mixed> = unknown;
