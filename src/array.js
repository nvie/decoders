// @flow

import { Err, Ok, Result } from 'lemons';

import { makeErr } from './error';
import type { Decoder } from './types';
import { compose } from './utils';

/**
 * Like a "Plain Old JavaScript Object", but for arrays: "Plain Old JavaScript
 * Array" ^_^
 */
export const poja: Decoder<Array<mixed>> = (blob: any) => {
    if (!Array.isArray(blob)) {
        return makeErr('Must be an array', blob, []);
    }
    return Ok(blob);
};

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
 * Given a T, builds a decoder that assumes an array input and returns an
 * Array<T>.
 */
function members<T>(decoder: Decoder<T>): Decoder<Array<T>, Array<mixed>> {
    return (blobs: Array<mixed>) => {
        const results = blobs.map(decoder);
        const result = all(results);
        return result.dispatch(
            value => Ok(value),
            ([index, e]) => makeErr(`Unexpected value at index ${index}`, e.blob, [e])
        );
    };
}

/**
 * Builds a Decoder that returns Ok for values of `Array<T>`, given a Decoder
 * for `T`.  Err otherwise.
 */
export function array<T>(decoder: Decoder<T>): Decoder<Array<T>> {
    return compose(poja, members(decoder));
}
