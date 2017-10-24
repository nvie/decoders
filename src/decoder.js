// @flow

import type { Decoder, Verifier } from './types';

export function decoder<T>(verifier: Verifier<T>): Decoder<T> {
    return (blob: any) => verifier(blob).unwrap();
}
