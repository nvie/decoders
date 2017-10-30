// @flow

import type { Decoder, Guard } from './types';

export function guard<T>(decoder: Decoder<T>): Guard<T> {
    return (blob: any) => decoder(blob).unwrap();
}
