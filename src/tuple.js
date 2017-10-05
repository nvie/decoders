// @flow

import { DecodeError } from './asserts';
import type { Decoder } from './types';
import { asArray } from './utils';

/**
 * Decodes a 2-tuple of [T, V] from the given input, given decoders for type T and V.
 */
export function decodeTuple2<T, V>(decoderT: Decoder<T>, decoderV: Decoder<V>): Decoder<[T, V]> {
    return (blobs: any) => {
        blobs = asArray(blobs);
        if (blobs.length !== 2) {
            throw DecodeError(
                'Not a 2-tuple',
                `Expected a 2-tuple, but got an array of ${blobs.length} elements`,
                blobs
            );
        }

        const [blob0, blob1] = blobs;

        let t0, t1;

        try {
            t0 = decoderT(blob0);
        } catch (e) {
            if ('blob' in e) {
                throw DecodeError('Unexpected value in 1st tuple position', '', blob0, [e]);
            } else {
                throw e;
            }
        }

        try {
            t1 = decoderV(blob1);
        } catch (e) {
            if ('blob' in e) {
                throw DecodeError('Unexpected value in 2nd tuple position', '', blob1, [e]);
            } else {
                throw e;
            }
        }

        return [t0, t1];
    };
}
