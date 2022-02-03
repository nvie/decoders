// @flow strict

import { annotate } from '../annotate';
import { define } from '../Decoder';
import type { _Any } from '../_utils';
import type { Annotation } from '../annotate';
import type { Decoder, DecodeResult } from '../Decoder';

/**
 * Accepts any array, but doesn't validate its items further.
 *
 * "poja" means "plain old JavaScript array", a play on `pojo()`.
 */
export const poja: Decoder<Array<mixed>> = define((blob, ok, err) => {
    if (!Array.isArray(blob)) {
        return err('Must be an array');
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

    // TODO: Make this less ugly
    ok: (Array<T>) => DecodeResult<Array<T>>,
    err: (Annotation) => DecodeResult<Array<T>>,
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

            return err(annotate(clone));
        }
    }
    return ok(results);
}

/**
 * Accepts arrays of whatever the given decoder accepts.
 */
export function array<T>(decoder: Decoder<T>): Decoder<Array<T>> {
    return poja.then((blobs: $ReadOnlyArray<mixed>, ok, err) => {
        const results = blobs.map(decoder.decode);
        return all(results, blobs, ok, err);
    });
}

/**
 * Like `array()`, but will reject arrays with 0 elements.
 */
export function nonEmptyArray<T>(decoder: Decoder<T>): Decoder<Array<T>> {
    return array(decoder).refine((arr) => arr.length > 0, 'Must be non-empty array');
}

/**
 * Similar to `array()`, but returns the result as an [ES6
 * Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).
 */
export function set<T>(decoder: Decoder<T>): Decoder<Set<T>> {
    return array(decoder).transform((items) => new Set(items));
}

const ntuple = (n: number) =>
    poja.refine((arr) => arr.length === n, `Must be a ${n}-tuple`);

// prettier-ignore
interface TupleT {
    <A>(a: Decoder<A>): Decoder<[A]>;
    <A, B>(a: Decoder<A>, b: Decoder<B>): Decoder<[A, B]>;
    <A, B, C>(a: Decoder<A>, b: Decoder<B>, c: Decoder<C>): Decoder<[A, B, C]>;
    <A, B, C, D>(a: Decoder<A>, b: Decoder<B>, c: Decoder<C>, d: Decoder<D>): Decoder<[A, B, C, D]>;
    <A, B, C, D, E>(a: Decoder<A>, b: Decoder<B>, c: Decoder<C>, d: Decoder<D>, e: Decoder<E>): Decoder<[A, B, C, D, E]>;
    <A, B, C, D, E, F>(a: Decoder<A>, b: Decoder<B>, c: Decoder<C>, d: Decoder<D>, e: Decoder<E>, f: Decoder<F>): Decoder<[A, B, C, D, E, F]>;
}

function _tuple(...decoders: $ReadOnlyArray<Decoder<mixed>>): Decoder<Array<mixed>> {
    return ntuple(decoders.length).then((blobs, ok, err) => {
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

/**
 * Accepts a tuple (an array with exactly _n_ items) of values accepted by the
 * _n_ given decoders.
 */
export const tuple: TupleT = (_tuple: _Any);
