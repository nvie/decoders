// @flow strict

import * as Result from './Result';
import { annotate } from './debrief';
import type { Decoder, Scalar } from './types';

/**
 * Decoder that only returns Ok for `null` inputs.  Err otherwise.
 */
export const null_: Decoder<null> = (blob: mixed) =>
    blob === null ? Result.ok(blob) : Result.err(annotate(blob, 'Must be null'));

/**
 * Decoder that only returns Ok for `undefined` inputs.  Err otherwise.
 */
export const undefined_: Decoder<void> = (blob: mixed) =>
    blob === undefined
        ? Result.ok(blob)
        : Result.err(annotate(blob, 'Must be undefined'));

/**
 * Decoder that only returns Ok for the given value constant.  Err otherwise.
 */
export function constant<T: Scalar>(value: T): Decoder<T> {
    return (blob: mixed) =>
        blob === value
            ? Result.ok(value)
            : Result.err(annotate(blob, `Must be constant ${String(value)}`));
}

/**
 * Decoder that always returns Ok for the given hardcoded value, no matter what the input.
 */
export function hardcoded<T>(value: T): Decoder<T> {
    return () => Result.ok(value);
}

/**
 * Decoder that always returns Ok for the given hardcoded value, no matter what the input.
 */
export const unknown: Decoder<mixed> = (blob: mixed) => Result.ok(blob);

/**
 * Alias of unknown.
 */
export const mixed: Decoder<mixed> = unknown;
