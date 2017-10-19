// @flow

import { Ok } from 'lemons';

import { makeErr } from './asserts';
import type { Verifier } from './types';

/**
 * Decodes a boolean value.
 * Will throw a DecodeError if anything other than a boolean value is found.
 */
export const boolean: Verifier<boolean> = (blob: any) => {
    return typeof blob === 'boolean' ? Ok(blob) : makeErr('Must be boolean');
};
