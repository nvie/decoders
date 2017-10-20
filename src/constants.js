// @flow

import { Ok } from 'lemons';

import { makeErr } from './asserts';
import type { Verifier } from './types';

/**
 * Verifier that only returns Ok for `null` inputs.  Err otherwise.
 */
export const Null: Verifier<null> = (blob: any) => (blob === null ? Ok(blob) : makeErr('Must be null'));

/**
 * Verifier that only returns Ok for `undefined` inputs.  Err otherwise.
 */
export const Undefined: Verifier<void> = (blob: any) => (blob === undefined ? Ok(blob) : makeErr('Must be undefined'));

/**
 * Verifier that only returns Ok for the given value constant.  Err otherwise.
 */
export function constant<T>(value: T) {
    return (blob: any) => (blob === value ? Ok(blob) : makeErr(`Must be constant ${(value: any)}`, '', blob));
}

/**
 * Verifier that always returns Ok for the given hardcoded value, no matter what the input.
 */
export function hardcoded<T>(value: T) {
    return (_: any) => Ok(value);
}
