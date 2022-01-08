// @flow strict

import { annotate } from '../annotate';
import { compose, predicate, transform } from './composition';
import { define } from '../_decoder';
import { err, ok } from '../result';
import type { Decoder, DecodeResult } from '../_decoder';

/**
 * Like a "Plain Old JavaScript Object", but for arrays: "Plain Old JavaScript
 * Array" ^_^
 */
export const poja: Decoder<Array<mixed>> = define((blob) => {
    if (!Array.isArray(blob)) {
        return err(annotate(blob, 'Must be an array'));
    }
    return ok(
        // NOTE: Since Flow 0.98, Array.isArray() returns $ReadOnlyArray<mixed>
        // instead of Array<mixed>.  For rationale, see
        // https://github.com/facebook/flow/issues/7684.  In this case, we
        // don't want to output read-only types because it's up to the user of
        // decoders to determine what they want to do with the decoded output.
        // If they want to write items into the array, that's fine!
        // The fastest way to turn a read-only array into a normal array in
        // Javascript is to use .slice() on it, see this benchmark:
        // http://jsben.ch/lO6C5
        blob.slice(),
    );
});

/**
 * Given an array of Result instances, loop over them all and return:
 * - An [index, err] tuple, indicating the (index of the) first Err instance
 *   encountered; or
 * - a new Ok with an array of all unwrapped Ok'ed values
 */
function all<T>(
    items: $ReadOnlyArray<DecodeResult<T>>,
    blobs: $ReadOnlyArray<mixed>,
): DecodeResult<Array<T>> {
    const results: Array<T> = [];
    for (let index = 0; index < items.length; ++index) {
        const result = items[index];
        if (result.ok) {
            results.push(result.value);
        } else {
            const ann = result.error;

            // Rewrite the annotation to include the index information, and inject it into the original blob
            const clone = [...blobs];
            clone.splice(
                index,
                1,
                annotate(
                    ann,
                    ann.text ? `${ann.text} (at index ${index})` : `index ${index}`,
                ),
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
            return err(annotate(clone));
        }
    }
    return ok(results);
}

/**
 * Given a T, builds a decoder that assumes an array input and returns an
 * Array<T>.
 */
function members<T>(decoder: Decoder<T>): Decoder<Array<T>, Array<mixed>> {
    return define((blobs: $ReadOnlyArray<mixed>) => {
        const results = blobs.map(decoder.decode);
        const result = all(results, blobs);
        return result;
    });
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
    return predicate(array(decoder), (arr) => arr.length > 0, 'Must be non-empty array');
}

/**
 * Similar to `array()`, but returns the result as an ES6 Set.
 */
export function set<T>(decoder: Decoder<T>): Decoder<Set<T>> {
    return transform(array(decoder), (items) => new Set(items));
}
