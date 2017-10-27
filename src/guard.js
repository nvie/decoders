// @flow

import type { Guard, Verifier } from './types';

export function guard<T>(verifier: Verifier<T>): Guard<T> {
    return (blob: any) => verifier(blob).unwrap();
}
