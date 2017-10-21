// @flow

import { Undefined } from './constants';
import { either } from './either';
import type { Verifier } from './types';

/**
 * Builds a Verifier that returns Ok for either `undefined` or `T` values,
 * given a Verifier for `T`.  Err otherwise.
 */
export function optional<T>(verifier: Verifier<T>): Verifier<void | T> {
    return either(Undefined, verifier);
}
