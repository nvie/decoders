// @flow

import { annotate } from 'debrief';
import { Err, Ok } from 'lemons';

import type { Decoder } from './types';

/**
 * Builds a Decoder that returns Ok for 2-tuples of [T1, T2], given Decoders
 * for T1 and T2.  Err otherwise.
 */
export function tuple2<T1, T2>(decoder1: Decoder<T1>, decoder2: Decoder<T2>): Decoder<[T1, T2]> {
    return (blobs: any) => {
        if (!Array.isArray(blobs)) {
            return Err(annotate(blobs, 'Must be an array'));
        }

        if (blobs.length !== 2) {
            return Err(annotate(blobs, 'Must be a 2-tuple'));
        }

        const [blob1, blob2] = blobs;

        const t1 = decoder1(blob1);
        return t1.dispatch(
            (value1: T1) => {
                const t2 = decoder2(blob2);
                return t2.dispatch((value2: T2) => Ok([value1, value2]), err => Err(annotate([blob1, err])));
            },
            err => Err(annotate([err, blob2]))
        );
    };
}
