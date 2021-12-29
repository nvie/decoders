// @flow strict

import { annotate } from '../annotate';
import { compose, predicate } from './composition';
import { err, ok } from '../result';
import { poja } from './array';
import type { _Any } from '../_utils';
import type { Decoder } from '../_types';

const ntuple = (n: number) =>
    predicate(poja, (arr) => arr.length === n, `Must be a ${n}-tuple`);

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
    return compose(ntuple(decoders.length), (blobs: $ReadOnlyArray<mixed>) => {
        let allOk = true;

        const rvs = decoders.map((decoder, i) => {
            const blob = blobs[i];
            const result = decoder(blob);
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
