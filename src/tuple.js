// @flow strict

import { annotate } from 'debrief';
import { Err, Ok } from 'lemons';

import type { Decoder } from './types';
import { compose, predicate } from './utils';
import { poja } from './array';

const ntuple = (n: number) =>
    compose(
        poja,
        predicate(arr => arr.length === n, `Must be a ${n}-tuple`)
    );

/**
 * Builds a Decoder that returns Ok for 2-tuples of [T1, T2], given Decoders
 * for T1 and T2.  Err otherwise.
 */
export function tuple2<T1, T2>(decoder1: Decoder<T1>, decoder2: Decoder<T2>): Decoder<[T1, T2]> {
    return compose(
        ntuple(2),
        (blobs: Array<mixed>) => {
            const [blob1, blob2] = blobs;

            const result1 = decoder1(blob1);
            const result2 = decoder2(blob2);
            try {
                return Ok([result1.unwrap(), result2.unwrap()]);
            } catch (e) {
                // If a decoder error has happened while unwrapping all the
                // results, try to construct a good error message
                return Err(
                    annotate([
                        result1.isErr() ? result1.errValue() : result1.value(),
                        result2.isErr() ? result2.errValue() : result2.value(),
                    ])
                );
            }
        }
    );
}
