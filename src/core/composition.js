// @flow strict

import { andThen, err, ok } from '../result';
import { annotate } from '../annotate';
import { define } from '../_decoder';
import type { Decoder } from '../_decoder';

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
    return define((blob) => andThen(decoder.decode(blob), next.decode));
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
    return define((blob) =>
        andThen(decoder.decode(blob), (value) =>
            predicateFn(value) ? ok(value) : err(annotate(value, msg)),
        ),
    );
}

/**
 * Pre-process the data input before passing it into the decoder. This gives
 * you the ability to arbitrarily customize the input on the fly before passing
 * it to the decoder. Of course, the input value at that point is still of
 * `unknown` type, so you will have to deal with that accordingly.
 */
export function prep<I, T>(mapperFn: (mixed) => I, decoder: Decoder<T, I>): Decoder<T> {
    return define((originalInput) => {
        let blob;
        try {
            blob = mapperFn(originalInput);
        } catch (e) {
            return err(annotate(originalInput, e.message));
        }

        const r = decoder.decode(blob);
        return r.ok ? r : err(annotate(originalInput, r.error.text));
        //                             ^^^^^^^^^^^^^
        //                             Annotates the _original_ input value
        //                             (instead of echoing back blob)
    });
}
