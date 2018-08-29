// @flow strict

import { undefined_ } from './constants';
import { either } from './either';
import type { Decoder } from './types';

/**
 * Builds a Decoder that returns Ok for either `undefined` or `T` values,
 * given a Decoder for `T`.  Err otherwise.
 */
export function optional<T>(decoder: Decoder<T>): Decoder<void | T> {
    return either(undefined_, decoder);
}
