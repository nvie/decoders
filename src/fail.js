// @flow

import { makeErr } from './asserts';
import type { Decoder } from './types';

/**
 * Decoder that always fails with the given error message, no matter what the input.
 */
export function fail<T>(msg: string): Decoder<T> {
    return (blob: any) => makeErr(msg, blob, []);
}
