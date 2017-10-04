// @flow

import { DecodeError } from './asserts';
import { decodeNull, decodeUndefined, decodeValue } from './primitives';
import type { Decoder } from './types';
import { asArray } from './utils';

/**
 * Decodes an Array<T> from the given input, given a decoder for type T.
 */
export function array<T>(itemDecoder: Decoder<T>): Decoder<Array<T>> {
    return (blobs: any) => {
        blobs = asArray(blobs);
        return blobs.map((blob, index) => {
            try {
                return itemDecoder(blob);
            } catch (e) {
                if ('blob' in e) {
                    throw DecodeError(`Unexpected value at index ${index}`, 'See below.', blob, [e]);
                } else {
                    throw e;
                }
            }
        });
    };
}
