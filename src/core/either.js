// @flow strict

import { annotate } from '../annotate';
import { err, ok } from '../result';
import { indent, summarize } from '../_utils';
import type { _Any } from '../_utils';
import type { Decoder, DecodeResult, Scalar } from '../_types';

const EITHER_PREFIX = 'Either:\n';

/**
 * Indents and adds a dash in front of this (potentially multiline) string.
 */
function itemize(s: string): string {
    return '-' + indent(s).substring(1);
}

/**
 * Nests another error as an item under a new-to-be-created "Either error". If
 * the given subitem already is an "Either error" of itself, don't indent, but
 * just "inject" its items at the same error level, for nicely flattened either
 * expressions.
 *
 * Avoids:
 *
 *     Either:
 *     - Either:
 *       - Must be P
 *       - Either:
 *         - Must be Q
 *         - Must be R
 *     - Must be S
 *
 * And "flattens" these to:
 *
 *     Either:
 *     - Must be P
 *     - Must be Q
 *     - Must be R
 *     - Must be S
 *
 */
function nest(errText: string): string {
    return errText.startsWith(EITHER_PREFIX)
        ? errText.substr(EITHER_PREFIX.length)
        : itemize(errText);
}

// prettier-ignore
interface EitherDecoderSignatures {
    <A>(d1: Decoder<A>): Decoder<A>;
    <A, B>(d1: Decoder<A>, d2: Decoder<B>): Decoder<A | B>;
    <A, B, C>(d1: Decoder<A>, d2: Decoder<B>, d3: Decoder<C>): Decoder<A | B | C>;
    <A, B, C, D>(d1: Decoder<A>, d2: Decoder<B>, d3: Decoder<C>, d4: Decoder<D>): Decoder<A | B | C | D>;
    <A, B, C, D, E>(d1: Decoder<A>, d2: Decoder<B>, d3: Decoder<C>, d4: Decoder<D>, d5: Decoder<E>): Decoder<A | B | C | D | E>;
    <A, B, C, D, E, F>(d1: Decoder<A>, d2: Decoder<B>, d3: Decoder<C>, d4: Decoder<D>, d5: Decoder<E>, d6: Decoder<F>): Decoder<A | B | C | D | E | F>;
    <A, B, C, D, E, F, G>(d1: Decoder<A>, d2: Decoder<B>, d3: Decoder<C>, d4: Decoder<D>, d5: Decoder<E>, d6: Decoder<F>, d7: Decoder<G>): Decoder<A | B | C | D | E | F | G>;
    <A, B, C, D, E, F, G, H>(d1: Decoder<A>, d2: Decoder<B>, d3: Decoder<C>, d4: Decoder<D>, d5: Decoder<E>, d6: Decoder<F>, d7: Decoder<G>, d8: Decoder<H>): Decoder<A | B | C | D | E | F | G | H>;
    <A, B, C, D, E, F, G, H, I>(d1: Decoder<A>, d2: Decoder<B>, d3: Decoder<C>, d4: Decoder<D>, d5: Decoder<E>, d6: Decoder<F>, d7: Decoder<G>, d8: Decoder<H>, d9: Decoder<I>): Decoder<A | B | C | D | E | F | G | H | I>;
    <A, B, C, D, E, F, G, H, I, J>(d1: Decoder<A>, d2: Decoder<B>, d3: Decoder<C>, d4: Decoder<D>, d5: Decoder<E>, d6: Decoder<F>, d7: Decoder<G>, d8: Decoder<H>, d9: Decoder<I>, d10: Decoder<J>): Decoder<A | B | C | D | E | F | G | H | I | J>;
    <A, B, C, D, E, F, G, H, I, J, K>(d1: Decoder<A>, d2: Decoder<B>, d3: Decoder<C>, d4: Decoder<D>, d5: Decoder<E>, d6: Decoder<F>, d7: Decoder<G>, d8: Decoder<H>, d9: Decoder<I>, d10: Decoder<J>, d11: Decoder<K>): Decoder<A | B | C | D | E | F | G | H | I | J | K>;
    <A, B, C, D, E, F, G, H, I, J, K, L>(d1: Decoder<A>, d2: Decoder<B>, d3: Decoder<C>, d4: Decoder<D>, d5: Decoder<E>, d6: Decoder<F>, d7: Decoder<G>, d8: Decoder<H>, d9: Decoder<I>, d10: Decoder<J>, d11: Decoder<K>, d12: Decoder<L>): Decoder<A | B | C | D | E | F | G | H | I | J | K | L>;
}

function _either(...decoders: $ReadOnlyArray<Decoder<mixed>>): Decoder<mixed> {
    if (decoders.length === 0) {
        throw new Error('Pass at least one decoder to either()');
    }

    return (blob: mixed) => {
        // Collect errors here along the way
        const errors = [];

        for (let i = 0; i < decoders.length; i++) {
            const result: DecodeResult<mixed> = decoders[i](blob);
            if (result.ok) {
                return result;
            } else {
                errors.push(result.error);
            }
        }

        // Decoding all alternatives failed, return the combined error message
        const text =
            EITHER_PREFIX +
            errors.map((err) => nest(summarize(err).join('\n'))).join('\n');
        return err(annotate(blob, text));
    };
}

export const either: EitherDecoderSignatures = (_either: _Any);

export function oneOf<T: Scalar>(constants: $ReadOnlyArray<T>): Decoder<T> {
    return (blob: mixed) => {
        const winner = constants.find((c) => c === blob);
        if (winner !== undefined) {
            return ok(winner);
        }
        return err(
            annotate(
                blob,
                `Must be one of ${constants
                    .map((value) => JSON.stringify(value))
                    .join(', ')}`,
            ),
        );
    };
}
