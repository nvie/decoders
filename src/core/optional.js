// @flow strict

import { annotate } from '../annotate';
import { define } from '../_decoder';
import { either } from './either';
import { err, ok } from '../result';
import { null_, undefined_ } from './constants';
import type { Decoder } from '../_decoder';

/**
 * Accepts whatever the given decoder accepts, or `undefined`.
 */
export function optional<T>(decoder: Decoder<T>): Decoder<void | T> {
    return either(undefined_, decoder);
}

/**
 * Accepts whatever the given decoder accepts, or `null`.
 */
export function nullable<T>(decoder: Decoder<T>): Decoder<null | T> {
    return either(null_, decoder);
}

/**
 * Decoder that only returns Ok for `null` or `undefined` inputs.
 * This is effectively equivalent to either(null_, undefined_), but combines
 * their error message output into a single line for convenience.
 */
const undefined_or_null: Decoder<null | void> = define((blob) =>
    blob === undefined || blob === null
        ? ok(blob)
        : // Combine error message into a single line
          err(annotate(blob, 'Must be undefined or null')),
);

/**
 * Accepts whatever the given decoder accepts, or `null`, or `undefined`.
 */
export function maybe<T>(decoder: Decoder<T>): Decoder<T | null | void> {
    return either(undefined_or_null, decoder);
}
