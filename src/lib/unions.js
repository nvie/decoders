// @flow strict

import { andThen } from '../result';
import { define } from '../_decoder';
import { indent, summarize } from '../_utils';
import { object } from './objects';
import { prep } from './utilities';
import type { _Any } from '../_utils';
import type { Decoder, DecodeResult, Scalar } from '../_decoder';

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
  <A>(a: Decoder<A>): Decoder<A>;
  <A, B>(a: Decoder<A>, b: Decoder<B>): Decoder<A | B>;
  <A, B, C>(a: Decoder<A>, b: Decoder<B>, c: Decoder<C>): Decoder<A | B | C>;
  <A, B, C, D>(a: Decoder<A>, b: Decoder<B>, c: Decoder<C>, d: Decoder<D>): Decoder<A | B | C | D>;
  <A, B, C, D, E>(a: Decoder<A>, b: Decoder<B>, c: Decoder<C>, d: Decoder<D>, e: Decoder<E>): Decoder<A | B | C | D | E>;
  <A, B, C, D, E, F>(a: Decoder<A>, b: Decoder<B>, c: Decoder<C>, d: Decoder<D>, e: Decoder<E>, f: Decoder<F>): Decoder<A | B | C | D | E | F>;
  <A, B, C, D, E, F, G>(a: Decoder<A>, b: Decoder<B>, c: Decoder<C>, d: Decoder<D>, e: Decoder<E>, f: Decoder<F>, g: Decoder<G>): Decoder<A | B | C | D | E | F | G>;
  <A, B, C, D, E, F, G, H>(a: Decoder<A>, b: Decoder<B>, c: Decoder<C>, d: Decoder<D>, e: Decoder<E>, f: Decoder<F>, g: Decoder<G>, h: Decoder<H>): Decoder<A | B | C | D | E | F | G | H>;
  <A, B, C, D, E, F, G, H, I>(a: Decoder<A>, b: Decoder<B>, c: Decoder<C>, d: Decoder<D>, e: Decoder<E>, f: Decoder<F>, g: Decoder<G>, h: Decoder<H>, i: Decoder<I>): Decoder<A | B | C | D | E | F | G | H | I>;
}

function _either(...decoders: $ReadOnlyArray<Decoder<mixed>>): Decoder<mixed> {
    if (decoders.length === 0) {
        throw new Error('Pass at least one decoder to either()');
    }

    return define((blob, _, reject) => {
        // Collect errors here along the way
        const errors = [];

        for (let i = 0; i < decoders.length; i++) {
            const result: DecodeResult<mixed> = decoders[i].decode(blob);
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
        return reject(text);
    });
}

export const either: EitherDecoderSignatures = (_either: _Any);

export function oneOf<T: Scalar>(constants: $ReadOnlyArray<T>): Decoder<T> {
    return define((blob, accept, reject) => {
        const winner = constants.find((c) => c === blob);
        if (winner !== undefined) {
            return accept(winner);
        }
        return reject(
            `Must be one of ${constants
                .map((value) => JSON.stringify(value))
                .join(', ')}`,
        );
    });
}

/**
 * Dispatches to one of several given decoders, based on the value found at
 * runtime in the given field.  For example, suppose you have these decoders:
 *
 *     const rectangle = object({
 *         type: constant('rect'),
 *         x: number,
 *         y: number,
 *         width: number,
 *         height: number,
 *     });
 *
 *     const circle = object({
 *         type: constant('circle'),
 *         cx: number,
 *         cy: number,
 *         r: number,
 *      });
 *
 * Then these two decoders are equivalent:
 *
 *     const shape = either(rectangle, circle)
 *     const shape = taggedUnion('type', { rectangle, circle })
 *
 * Will be of type Decoder<Rectangle | Circle>.
 *
 * But `taggedUnion` will typically be more runtime-efficient.  The reason is
 * that it will first do minimal work to "look ahead" into the `type` field
 * here, and based on that value, pick the decoder to invoke.
 *
 * The `either` version will simply try to invoke each decoder, until it finds
 * one that matches.
 *
 * Also, the error messages will be less ambiguous using `taggedUnion()`.
 */
export function taggedUnion<O: { +[field: string]: Decoder<_Any>, ... }>(
    field: string,
    mapping: O,
): Decoder<$Values<$ObjMap<O, <T>(Decoder<T>) => T>>> {
    const base = object({
        [field]: prep(String, oneOf(Object.keys(mapping))),
    });
    return define((blob) => {
        return andThen(base.decode(blob), (baseObj) => {
            const decoderName = baseObj[field];
            const decoder = mapping[decoderName];
            return decoder.decode(blob);
        });
    });
}
