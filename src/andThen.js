// @flow

import type { Decoder } from './types';

/**
 * Create a decoder that, when decoding A works, will allow you to generate a decoder B on
 * the fly, based on the parsed-out value of A, then continue feeding that decoder the
 * original blob.
 */
export function andThen<A, B>(decoderFactory: A => Decoder<B>, decoder: Decoder<A>): Decoder<B> {
    return (blob: any) => {
        let valueA = decoder(blob);
        let decoderB = decoderFactory(valueA);
        return decoderB(blob);
    };
}
