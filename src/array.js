// @flow

import { Ok } from 'lemons';

import { makeErr } from './asserts';
import type { Verifier } from './types';

/**
 * Builds a Verifier for `Array<T>`, given a Verifier for `T`.
 */
export function array<T>(verifier: Verifier<T>): Verifier<Array<T>> {
    return (blobs: any) => {
        if (!Array.isArray(blobs)) {
            return makeErr('Must be an array');
        }

        // Introspect the items in the array to be of type T.  If any of them
        // produce Err, then the entire result will be an Err.

        const results: Array<T> = [];
        let index = 0;
        for (const blob of blobs) {
            const result = verifier(blob);
            try {
                const value = result.unwrap();
                results.push(value);
            } catch (e) {
                return makeErr(`Unexpected value at index ${index}`, '', blob, [e]);
            }
            index++;
        }

        return Ok(results);
    };
}
