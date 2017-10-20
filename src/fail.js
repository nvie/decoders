// @flow

import { makeErr } from './asserts';
import type { Verifier } from './types';

export function fail<T>(msg: string): Verifier<T> {
    return (/* blob */) => makeErr(msg);
}
