// @flow strict

import type { Decoder } from './types';

/**
 * Given an function returning a Decoder, will use that decoder to decode the
 * value. This is typically used to build decoders for recursive or
 * self-referential types.
 */
export function lazy<T>(decoderFactory: () => Decoder<T>): Decoder<T> {
    return (blob: mixed) => {
        const decoder = decoderFactory();
        return decoder(blob);
    };
}
