// @flow

import { Ok } from 'lemons';

import { makeErr } from './asserts';
import type { Decoder } from './types';

/**
 * Decoder that only returns Ok for boolean inputs.  Err otherwise.
 */
export const boolean: Decoder<boolean> = (blob: any) => {
    return typeof blob === 'boolean' ? Ok(blob) : makeErr('Must be boolean');
};
