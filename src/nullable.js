// @flow

import { Null } from './constants';
import { either } from './either';
import type { Verifier } from './types';

export function nullable<T>(verifier: Verifier<T>): Verifier<null | T> {
    return either(Null, verifier);
}
