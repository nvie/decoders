// @flow

import { annotate } from 'debrief';
import { Err, Ok } from 'lemons';

import type { Decoder } from './types';
import { compose, predicate } from './utils';

/**
 * Decoder that only returns Ok for string inputs.  Err otherwise.
 */
export const string: Decoder<string> = (blob: any) => {
    return typeof blob === 'string' ? Ok(blob) : Err(annotate(blob, 'Must be string'));
};

/**
 * Decoder that only returns Ok for string inputs that match the regular
 * expression.  Err otherwise.  Will always validate that the input is a string
 * before testing the regex.
 */
export function regex(regex: RegExp, msg: string): Decoder<string> {
    return compose(string, predicate(s => regex.test(s), msg));
}
