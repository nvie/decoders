// @flow strict

import * as Result from './Result';
import { annotate } from 'debrief';
import { either } from './either';
import { null_, undefined_ } from './constants';
import type { Decoder } from './types';

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
const undefined_or_null: Decoder<null | void> = (blob: mixed) =>
    blob === undefined || blob === null
        ? Result.ok(blob)
        : // Combine error message into a single line
          Result.err(annotate(blob, 'Must be undefined or null'));

/**
 * Decoder that only returns Ok for `null` or `undefined` inputs.
 */
export function maybe<T>(decoder: Decoder<T>): Decoder<?T> {
    return either(undefined_or_null, decoder);
}
