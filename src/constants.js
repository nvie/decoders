// @flow

import { Ok } from 'lemons';

import { makeErr } from './asserts';
import type { Decoder } from './types';

/**
 * Decoder that only returns Ok for `null` inputs.  Err otherwise.
 */
export const null_: Decoder<null> = (blob: any) => (blob === null ? Ok(blob) : makeErr('Must be null'));

/**
 * Decoder that only returns Ok for `undefined` inputs.  Err otherwise.
 */
export const undefined_: Decoder<void> = (blob: any) => (blob === undefined ? Ok(blob) : makeErr('Must be undefined'));

/**
 * Decoder that only returns Ok for the given value constant.  Err otherwise.
 */
export function constant<T>(value: T) {
    return (blob: any) => (blob === value ? Ok(blob) : makeErr(`Must be constant ${(value: any)}`, '', blob));
}

/**
 * Decoder that always returns Ok for the given hardcoded value, no matter what the input.
 */
export function hardcoded<T>(value: T) {
    return (_: any) => Ok(value);
}
