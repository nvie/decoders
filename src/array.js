// @flow strict

import { annotate } from 'debrief';
import { Err, Ok } from 'lemons/Result';

import type { DecodeResult, Decoder } from './types';
import { compose, predicate } from './utils';

/**
 * Like a "Plain Old JavaScript Object", but for arrays: "Plain Old JavaScript
 * Array" ^_^
 */
export const poja: Decoder<Array<mixed>> = (blob: mixed) => {
    if (!Array.isArray(blob)) {
        return Err(annotate(blob, 'Must be an array'));
    }
    return Ok(
        // NOTE: Since Flow 0.98, Array.isArray() returns $ReadOnlyArray<mixed>
        // instead of Array<mixed>.  For rationale, see
        // https://github.com/facebook/flow/issues/7684.  In this case, we
        // don't want to output read-only types because it's up to the user of
        // decoders to determine what they want to do with the decoded output.
        // If they want to write items into the array, that's fine!
        // The fastest way to turn a read-only array into a normal array in
        // Javascript is to use .slice() on it, see this benchmark:
        // http://jsben.ch/lO6C5
        blob.slice()
    );
};

/**
 * Given an iterable of Result instances, exhaust them all and return:
 * - An [index, err] tuple, indicating the (index of the) first Err instance
 *   encountered; or
 * - a new Ok with an array of all unwrapped Ok'ed values
 */
function all<T>(
    iterable: $ReadOnlyArray<DecodeResult<T>>,
    blobs: $ReadOnlyArray<mixed>
): DecodeResult<Array<T>> {
    const results: Array<T> = [];
    let index = 0;
    for (const result of iterable) {
        try {
            const value = result.unwrap();
            results.push(value);
        } catch (ann) {
            // Rewrite the annotation to include the index information, and inject it into the original blob
            const clone = [...blobs];
            clone.splice(
                index,
                1,
                annotate(
                    ann,
                    ann.annotation !== undefined
                        ? `${ann.annotation} (at index ${index})`
                        : `index ${index}`
                )
            );

            // const errValue = [];
            // if (index > 0) {
            //     errValue.push('...'); // TODO: make special mark, not string!
            // }
            // errValue.push(
            // );
            // if (index < iterable.length - 1) {
            //     errValue.push('...'); // TODO: make special mark, not string!
            // }
            return Err(annotate(clone));
        }
        index++;
    }
    return Ok(results);
}

/**
 * Given a T, builds a decoder that assumes an array input and returns an
 * Array<T>.
 */
function members<T>(decoder: Decoder<T>): Decoder<Array<T>, Array<mixed>> {
    return (blobs: $ReadOnlyArray<mixed>) => {
        const results = blobs.map(decoder);
        const result = all(results, blobs);
        return result;
    };
}

/**
 * Builds a Decoder that returns Ok for values of `Array<T>`, given a Decoder
 * for `T`.  Err otherwise.
 */
export function array<T>(decoder: Decoder<T>): Decoder<Array<T>> {
    return compose(poja, members(decoder));
}

/**
 * Builds a Decoder that returns Ok for values of `Array<T>`, but will reject
 * empty arrays.
 */
export function nonEmptyArray<T>(decoder: Decoder<T>): Decoder<Array<T>> {
    return compose(
        array(decoder),
        predicate((arr) => arr.length > 0, 'Must be non-empty array')
    );
}
