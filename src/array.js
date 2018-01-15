// @flow

import { annotate } from 'debrief';
import { Err, Ok } from 'lemons';

import type { DecodeResult, Decoder } from './types';
import { compose } from './utils';

/**
 * Like a "Plain Old JavaScript Object", but for arrays: "Plain Old JavaScript
 * Array" ^_^
 */
export const poja: Decoder<Array<mixed>> = (blob: any) => {
    if (!Array.isArray(blob)) {
        return Err(annotate(blob, 'Must be an array'));
    }
    return Ok(blob);
};

/**
 * Given an iterable of Result instances, exhaust them all and return:
 * - An [index, err] tuple, indicating the (index of the) first Err instance
 *   encountered; or
 * - a new Ok with an array of all unwrapped Ok'ed values
 */
function all<T>(iterable: Array<DecodeResult<T>>, blobs: any): DecodeResult<Array<T>> {
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
                annotate(ann, ann.annotation !== undefined ? `${ann.annotation} (at index ${index})` : `index ${index}`)
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
    return (blobs: Array<mixed>) => {
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
