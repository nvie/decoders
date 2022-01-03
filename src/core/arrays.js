// @flow strict

import { annotate } from '../annotate';
import { define } from '../_decoder';
import { err, ok } from '../result';
import type { _Any } from '../_utils';
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
 * Accepts arrays of whatever the given decoder accepts.
 */
export function array<T>(decoder: Decoder<T>): Decoder<Array<T>> {
    return poja.chain((blobs: $ReadOnlyArray<mixed>) => {
        const results = blobs.map(decoder.decode);
        return all(results, blobs);
    });
}

/**
 * Like `array()`, but will reject arrays with 0 elements.
 */
export function nonEmptyArray<T>(decoder: Decoder<T>): Decoder<Array<T>> {
    return array(decoder).and((arr) => arr.length > 0, 'Must be non-empty array');
}

/**
 * Similar to `array()`, but returns the result as an [ES6
 * Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).
 */
export function set<T>(decoder: Decoder<T>): Decoder<Set<T>> {
    return array(decoder).transform((items) => new Set(items));
}

const ntuple = (n: number) => poja.and((arr) => arr.length === n, `Must be a ${n}-tuple`);

// prettier-ignore
interface TupleFuncSignature {
    <A>(a: Decoder<A>): Decoder<[A]>;
    <A, B>(a: Decoder<A>, b: Decoder<B>): Decoder<[A, B]>;
    <A, B, C>(a: Decoder<A>, b: Decoder<B>, c: Decoder<C>): Decoder<[A, B, C]>;
    <A, B, C, D>(a: Decoder<A>, b: Decoder<B>, c: Decoder<C>, d: Decoder<D>): Decoder<[A, B, C, D]>;
    <A, B, C, D, E>(a: Decoder<A>, b: Decoder<B>, c: Decoder<C>, d: Decoder<D>, e: Decoder<E>): Decoder<[A, B, C, D, E]>;
    <A, B, C, D, E, F>(a: Decoder<A>, b: Decoder<B>, c: Decoder<C>, d: Decoder<D>, e: Decoder<E>, f: Decoder<F>): Decoder<[A, B, C, D, E, F]>;
}

/**
 * Accepts n-tuples [A, B, C, ...] matching the given decoders A, B, C, ...
 */
function _tuple(...decoders: $ReadOnlyArray<Decoder<mixed>>): Decoder<mixed> {
    return ntuple(decoders.length).chain((blobs) => {
        let allOk = true;

        const rvs = decoders.map((decoder, i) => {
            const blob = blobs[i];
            const result = decoder.decode(blob);
            if (result.ok) {
                return result.value;
            } else {
                allOk = false;
                return result.error;
            }
        });

        if (allOk) {
            return ok(rvs);
        } else {
            // If a decoder error has happened while unwrapping all the
            // results, try to construct a good error message
            return err(annotate(rvs));
        }
    });
}

export const tuple: TupleFuncSignature = (_tuple: _Any);
