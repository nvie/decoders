// @flow

import { annotate } from 'debrief';
import { Err, Ok } from 'lemons';

import { undefined_ } from './constants';
import { either } from './either';
import type { Decoder } from './types';

/**
 * Decoder that only returns Ok for `null` or `undefined` inputs.  In both
 * cases, it will return `undefined`, so `null` inputs will get converted to
 * `undefined` outputs.  Err otherwise.
 */
export const undefined_or_null: Decoder<void> = (blob: any) =>
    blob === undefined || blob === null ? Ok(undefined) : Err(annotate(blob, 'Must be undefined or null'));

/**
 * Builds a Decoder that returns Ok for either `undefined` or `T` values,
 * given a Decoder for `T`.  Err otherwise.
 */
export function optional<T>(decoder: Decoder<T>, allowNull: boolean = false): Decoder<void | T> {
    return either(allowNull ? undefined_or_null : undefined_, decoder);
}
