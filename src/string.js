// @flow

import { Ok } from 'lemons';

import { makeErr } from './error';
import type { Decoder } from './types';

/**
 * Decoder that only returns Ok for string inputs.  Err otherwise.
 */
export const string: Decoder<string> = (blob: any) => {
    return typeof blob === 'string' ? Ok(blob) : makeErr('Must be string', blob, []);
};
