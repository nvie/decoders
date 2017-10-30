// @flow

import { Err, Ok, Result } from 'lemons';

import { makeErr } from './error';
import type { Decoder } from './types';

/**
 * Given an iterable of Result instances, exhaust them all and return:
 * - An [index, err] tuple, indicating the (index of the) first Err instance
 *   encountered; or
 * - a new Ok with an array of all unwrapped Ok'ed values
 */
function all<E, T>(iterable: Iterable<Result<E, T>>): Result<[number, E], Array<T>> {
    const results: Array<T> = [];
    let index = 0;
    for (const result of iterable) {
        try {
            const value = result.unwrap();
            results.push(value);
        } catch (e) {
            return Err([index, e]);
        }
        index++;
    }
    return Ok(results);
}

/**
 * Builds a Decoder that returns Ok for values of `Array<T>`, given a Decoder
 * for `T`.  Err otherwise.
 */
export function array<T>(decoder: Decoder<T>): Decoder<Array<T>> {
    return (blobs: any) => {
        if (!Array.isArray(blobs)) {
            return makeErr('Must be an array', blobs, []);
        }

        const results = blobs.map(decoder);
        const result = all(results);
        return result.dispatch(
            value => Ok(value),
            ([index, e]) => makeErr(`Unexpected value at index ${index}`, e.blob, [e])
        );
    };
}
