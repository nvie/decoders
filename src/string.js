// @flow

import { Ok } from 'lemons';

import { makeErr } from './error';
import type { Decoder } from './types';
import { compose, predicate } from './utils';

/**
 * Decoder that only returns Ok for string inputs.  Err otherwise.
 */
export const string: Decoder<string> = (blob: any) => {
    return typeof blob === 'string' ? Ok(blob) : makeErr('Must be string', blob, []);
};

/**
 * Decoder that only returns Ok for string inputs that match the regular
 * expression.  Err otherwise.  Will always validate that the input is a string
 * before testing the regex.
 */
export function regex(regex: RegExp, msg: string): Decoder<string> {
    return compose(string, predicate(s => regex.test(s), msg));
}
