// @flow

import type { Decoder } from './types';

/**
 * Create a decoder that, when decoding A works, will allow you to generate a decoder B on
 * the fly, based on the parsed-out value of A, then continue feeding that decoder the
 * original blob.
 */
export function map<T, V>(decoder: Decoder<T>, mapper: T => V): Decoder<V> {
    return (blob: any) => {
        let value: T = decoder(blob);
        return mapper(value);
    };
}
