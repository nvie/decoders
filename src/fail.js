// @flow

import { makeErr } from './asserts';
import type { Verifier } from './types';

/**
 * Verifier that always fails with the given error message, no matter what the input.
 */
export function fail<T>(msg: string): Verifier<T> {
    return (_: any) => makeErr(msg);
}
