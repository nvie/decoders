// @flow

import { Ok } from 'lemons';

import type { Verifier } from './types';
import { makeErr } from './asserts';

/**
 * Verifier that only returns Ok for string inputs.  Err otherwise.
 */
export const string: Verifier<string> = (blob: any) => {
    return typeof blob === 'string' ? Ok(blob) : makeErr('Must be string');
};
