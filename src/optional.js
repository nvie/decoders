// @flow

import { Undefined } from './constants';
import { either } from './either';
import type { Verifier } from './types';

export function optional<T>(verifier: Verifier<T>): Verifier<void | T> {
    return either(Undefined, verifier);
}
