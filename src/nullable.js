// @flow

import { null_ } from './constants';
import { either } from './either';
import type { Verifier } from './types';

export function nullable<T>(verifier: Verifier<T>): Verifier<null | T> {
    return either(null_, verifier);
}
