// @flow strict

import { annotate } from '../annotate';
import { err, ok, orElse } from '../result';
import { indent, summarize } from '../_utils';
import type { Decoder, Scalar } from '../_types';

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
    const EITHER_PREFIX = 'Either:\n';
    return errText.startsWith(EITHER_PREFIX)
        ? errText.substr(EITHER_PREFIX.length)
        : itemize(errText);
}

export function either<T1, T2>(d1: Decoder<T1>, d2: Decoder<T2>): Decoder<T1 | T2> {
    return (blob: mixed) =>
        orElse(d1(blob), (err1) =>
            orElse(d2(blob), (err2) => {
                const serr1 = summarize(err1).join('\n');
                const serr2 = summarize(err2).join('\n');
                const text = ['Either:', nest(serr1), nest(serr2)].join('\n');
                return err(annotate(blob, text));
            }),
        );
}

export function either3<T1, T2, T3>(
    d1: Decoder<T1>,
    d2: Decoder<T2>,
    d3: Decoder<T3>,
): Decoder<T1 | T2 | T3> {
    return either(d1, either(d2, d3));
}

export function either4<T1, T2, T3, T4>(
    d1: Decoder<T1>,
    d2: Decoder<T2>,
    d3: Decoder<T3>,
    d4: Decoder<T4>,
): Decoder<T1 | T2 | T3 | T4> {
    return either(d1, either3(d2, d3, d4));
}

export function either5<T1, T2, T3, T4, T5>(
    d1: Decoder<T1>,
    d2: Decoder<T2>,
    d3: Decoder<T3>,
    d4: Decoder<T4>,
    d5: Decoder<T5>,
): Decoder<T1 | T2 | T3 | T4 | T5> {
    return either(d1, either4(d2, d3, d4, d5));
}

export function either6<T1, T2, T3, T4, T5, T6>(
    d1: Decoder<T1>,
    d2: Decoder<T2>,
    d3: Decoder<T3>,
    d4: Decoder<T4>,
    d5: Decoder<T5>,
    d6: Decoder<T6>,
): Decoder<T1 | T2 | T3 | T4 | T5 | T6> {
    return either(d1, either5(d2, d3, d4, d5, d6));
}

export function either7<T1, T2, T3, T4, T5, T6, T7>(
    d1: Decoder<T1>,
    d2: Decoder<T2>,
    d3: Decoder<T3>,
    d4: Decoder<T4>,
    d5: Decoder<T5>,
    d6: Decoder<T6>,
    d7: Decoder<T7>,
): Decoder<T1 | T2 | T3 | T4 | T5 | T6 | T7> {
    return either(d1, either6(d2, d3, d4, d5, d6, d7));
}

export function either8<T1, T2, T3, T4, T5, T6, T7, T8>(
    d1: Decoder<T1>,
    d2: Decoder<T2>,
    d3: Decoder<T3>,
    d4: Decoder<T4>,
    d5: Decoder<T5>,
    d6: Decoder<T6>,
    d7: Decoder<T7>,
    d8: Decoder<T8>,
): Decoder<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8> {
    return either(d1, either7(d2, d3, d4, d5, d6, d7, d8));
}

export function either9<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
    d1: Decoder<T1>,
    d2: Decoder<T2>,
    d3: Decoder<T3>,
    d4: Decoder<T4>,
    d5: Decoder<T5>,
    d6: Decoder<T6>,
    d7: Decoder<T7>,
    d8: Decoder<T8>,
    d9: Decoder<T9>,
): Decoder<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9> {
    return either(d1, either8(d2, d3, d4, d5, d6, d7, d8, d9));
}

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
