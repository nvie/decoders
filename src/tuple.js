// @flow

import { Ok } from 'lemons';

import { makeErr } from './error';
import type { Decoder } from './types';

/**
 * Builds a Decoder that returns Ok for 2-tuples of [T1, T2], given Decoders
 * for T1 and T2.  Err otherwise.
 */
export function tuple2<T1, T2>(decoder1: Decoder<T1>, decoder2: Decoder<T2>): Decoder<[T1, T2]> {
    return (blobs: any) => {
        if (!Array.isArray(blobs)) {
            return makeErr('Must be an array', blobs, []);
        }

        if (blobs.length !== 2) {
            return makeErr('Must be a 2-tuple', blobs, []);
        }

        const [blob1, blob2] = blobs;

        const t1 = decoder1(blob1);
        return t1.dispatch(
            (value1: T1) => {
                const t2 = decoder2(blob2);
                return t2.dispatch(
                    (value2: T2) => Ok([value1, value2]),
                    e => makeErr('Unexpected value in 2nd tuple position', blob2, [e])
                );
            },
            e => makeErr('Unexpected value in 1st tuple position', blob1, [e])
        );
    };
}
