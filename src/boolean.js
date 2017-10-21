// @flow

import { Ok } from 'lemons';

import { makeErr } from './asserts';
import type { Verifier } from './types';

/**
 * Verifier that only returns Ok for boolean inputs.  Err otherwise.
 */
export const boolean: Verifier<boolean> = (blob: any) => {
    return typeof blob === 'boolean' ? Ok(blob) : makeErr('Must be boolean');
};
