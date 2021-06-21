// @flow strict

import { annotate } from 'debrief';
import { Err, Ok } from 'lemons/Result';

import { poja } from './array';
import type { Decoder } from './types';
import { compose, predicate } from './utils';

const ntuple = (n: number) =>
    compose(
        poja,
        predicate((arr) => arr.length === n, `Must be a ${n}-tuple`)
    );

/**
 * Builds a Decoder that returns Ok for 1-tuple of [T], given a Decoder for T.
 * Err otherwise.
 */
export function tuple1<T>(decoder1: Decoder<T>): Decoder<[T]> {
    return compose(ntuple(1), (blobs: $ReadOnlyArray<mixed>) => {
        const [blob1] = blobs;

        const result1 = decoder1(blob1);
        try {
            return Ok([result1.unwrap()]);
        } catch (e) {
            // If a decoder error has happened while unwrapping all the
            // results, try to construct a good error message
            return Err(annotate(result1.errValue()));
        }
    });
}

/**
 * Builds a Decoder that returns Ok for 2-tuples of [T1, T2], given Decoders
 * for T1 and T2.  Err otherwise.
 */
export function tuple2<T1, T2>(
    decoder1: Decoder<T1>,
    decoder2: Decoder<T2>
): Decoder<[T1, T2]> {
    return compose(ntuple(2), (blobs: $ReadOnlyArray<mixed>) => {
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
    });
}

/**
 * Builds a Decoder that returns Ok for 3-tuples of [T1, T2, T3], given
 * Decoders for T1, T2, and T3.  Err otherwise.
 */
export function tuple3<T1, T2, T3>(
    decoder1: Decoder<T1>,
    decoder2: Decoder<T2>,
    decoder3: Decoder<T3>
): Decoder<[T1, T2, T3]> {
    return compose(ntuple(3), (blobs: $ReadOnlyArray<mixed>) => {
        const [blob1, blob2, blob3] = blobs;

        const result1 = decoder1(blob1);
        const result2 = decoder2(blob2);
        const result3 = decoder3(blob3);
        try {
            return Ok([result1.unwrap(), result2.unwrap(), result3.unwrap()]);
        } catch (e) {
            // If a decoder error has happened while unwrapping all the
            // results, try to construct a good error message
            return Err(
                annotate([
                    result1.isErr() ? result1.errValue() : result1.value(),
                    result2.isErr() ? result2.errValue() : result2.value(),
                    result3.isErr() ? result3.errValue() : result3.value(),
                ])
            );
        }
    });
}

/**
 * Builds a Decoder that returns Ok for 4-tuples of [T1, T2, T3, T4], given
 * Decoders for T1, T2, T3, and T4.  Err otherwise.
 */
export function tuple4<T1, T2, T3, T4>(
    decoder1: Decoder<T1>,
    decoder2: Decoder<T2>,
    decoder3: Decoder<T3>,
    decoder4: Decoder<T4>
): Decoder<[T1, T2, T3, T4]> {
    return compose(ntuple(4), (blobs: $ReadOnlyArray<mixed>) => {
        const [blob1, blob2, blob3, blob4] = blobs;

        const result1 = decoder1(blob1);
        const result2 = decoder2(blob2);
        const result3 = decoder3(blob3);
        const result4 = decoder4(blob4);
        try {
            return Ok([
                result1.unwrap(),
                result2.unwrap(),
                result3.unwrap(),
                result4.unwrap(),
            ]);
        } catch (e) {
            // If a decoder error has happened while unwrapping all the
            // results, try to construct a good error message
            return Err(
                annotate([
                    result1.isErr() ? result1.errValue() : result1.value(),
                    result2.isErr() ? result2.errValue() : result2.value(),
                    result3.isErr() ? result3.errValue() : result3.value(),
                    result4.isErr() ? result4.errValue() : result4.value(),
                ])
            );
        }
    });
}

/**
 * Builds a Decoder that returns Ok for 5-tuples of [T1, T2, T3, T4, T5], given
 * Decoders for T1, T2, T3, T4, and T5.  Err otherwise.
 */
export function tuple5<T1, T2, T3, T4, T5>(
    decoder1: Decoder<T1>,
    decoder2: Decoder<T2>,
    decoder3: Decoder<T3>,
    decoder4: Decoder<T4>,
    decoder5: Decoder<T5>
): Decoder<[T1, T2, T3, T4, T5]> {
    return compose(ntuple(5), (blobs: $ReadOnlyArray<mixed>) => {
        const [blob1, blob2, blob3, blob4, blob5] = blobs;

        const result1 = decoder1(blob1);
        const result2 = decoder2(blob2);
        const result3 = decoder3(blob3);
        const result4 = decoder4(blob4);
        const result5 = decoder5(blob5);
        try {
            return Ok([
                result1.unwrap(),
                result2.unwrap(),
                result3.unwrap(),
                result4.unwrap(),
                result5.unwrap(),
            ]);
        } catch (e) {
            // If a decoder error has happened while unwrapping all the
            // results, try to construct a good error message
            return Err(
                annotate([
                    result1.isErr() ? result1.errValue() : result1.value(),
                    result2.isErr() ? result2.errValue() : result2.value(),
                    result3.isErr() ? result3.errValue() : result3.value(),
                    result4.isErr() ? result4.errValue() : result4.value(),
                    result5.isErr() ? result5.errValue() : result5.value(),
                ])
            );
        }
    });
}

/**
 * Builds a Decoder that returns Ok for 5-tuples of [T1, T2, T3, T4, T5], given
 * Decoders for T1, T2, T3, T4, T5, and T6.  Err otherwise.
 */
export function tuple6<T1, T2, T3, T4, T5, T6>(
    decoder1: Decoder<T1>,
    decoder2: Decoder<T2>,
    decoder3: Decoder<T3>,
    decoder4: Decoder<T4>,
    decoder5: Decoder<T5>,
    decoder6: Decoder<T6>
): Decoder<[T1, T2, T3, T4, T5, T6]> {
    return compose(ntuple(6), (blobs: $ReadOnlyArray<mixed>) => {
        const [blob1, blob2, blob3, blob4, blob5, blob6] = blobs;

        const result1 = decoder1(blob1);
        const result2 = decoder2(blob2);
        const result3 = decoder3(blob3);
        const result4 = decoder4(blob4);
        const result5 = decoder5(blob5);
        const result6 = decoder6(blob6);
        try {
            return Ok([
                result1.unwrap(),
                result2.unwrap(),
                result3.unwrap(),
                result4.unwrap(),
                result5.unwrap(),
                result6.unwrap(),
            ]);
        } catch (e) {
            // If a decoder error has happened while unwrapping all the
            // results, try to construct a good error message
            return Err(
                annotate([
                    result1.isErr() ? result1.errValue() : result1.value(),
                    result2.isErr() ? result2.errValue() : result2.value(),
                    result3.isErr() ? result3.errValue() : result3.value(),
                    result4.isErr() ? result4.errValue() : result4.value(),
                    result5.isErr() ? result5.errValue() : result5.value(),
                    result6.isErr() ? result6.errValue() : result6.value(),
                ])
            );
        }
    });
}
