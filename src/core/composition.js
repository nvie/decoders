// @flow strict

import { andThen, err, ok } from '../result';
import { annotate } from '../annotate';
import type { Decoder } from '../_types';

/**
 * Given a decoder T and a mapping function from T's to V's, returns a decoder
 * for V's.  This is useful to change the original input data.
 */
export function map<T, V>(decoder: Decoder<T>, mapper: (T) => V): Decoder<V> {
    return compose(decoder, (x) => {
        try {
            return ok(mapper(x));
        } catch (e) {
            return err(annotate(x, e instanceof Error ? e.message : String(e)));
        }
    });
}

/**
 * Compose two decoders by passing the result of the first into the second.
 * The second decoder may assume as its input type the output type of the first
 * decoder (so it's not necessary to accept the typical "mixed").  This is
 * useful for "narrowing down" the checks.  For example, if you want to write
 * a decoder for positive numbers, you can compose it from an existing decoder
 * for any number, and a decoder that, assuming a number, checks if it's
 * positive.  Very often combined with the predicate() helper as the second
 * argument.
 */
export function compose<T, V>(decoder: Decoder<T>, next: Decoder<V, T>): Decoder<V> {
    return (blob: mixed) => andThen(decoder(blob), next);
}

/**
 * Factory function returning a Decoder<T>, given a predicate function that
 * accepts/rejects the input of type T.
 */
export function predicate<T>(
    decoder: Decoder<T>,
    predicateFn: (T) => boolean,
    msg: string,
): Decoder<T> {
    return (blob: mixed) =>
        andThen(decoder(blob), (value) =>
            predicateFn(value) ? ok(value) : err(annotate(value, msg)),
        );
}
