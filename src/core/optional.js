// @flow strict

import { annotate } from '../annotate';
import { define } from '../_decoder';
import { either } from './either';
import { err, ok } from '../result';
import { null_, undefined_ } from './constants';
import type { Decoder } from '../_decoder';

/**
 * Builds a Decoder that returns Ok for either `undefined` or `T` values,
 * given a Decoder for `T`.  Err otherwise.
 */
export function optional<T>(decoder: Decoder<T>): Decoder<void | T> {
    return either(undefined_, decoder);
}

/**
 * Builds a Decoder that returns Ok for either `null` or `T` values,
 * given a Decoder for `T`.  Err otherwise.
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
 * Decoder that only returns Ok for `null` or `undefined` inputs.
 */
export function maybe<T>(decoder: Decoder<T>): Decoder<?T> {
    return either(undefined_or_null, decoder);
}
