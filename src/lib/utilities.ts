// @flow strict

import { annotate } from '../annotate';
import { define } from '../Decoder';
import type { Decoder } from '../Decoder';

/**
 * Accepts any value that is an ``instanceof`` the given class.
 */
export function instanceOf<T>(klass: Class<T>): Decoder<T> {
    return define((blob, ok, err) =>
        blob instanceof klass
            ? ok(blob)
            : err(
                  `Must be ${
                      // $FlowFixMe[incompatible-use] - klass.name is fine?
                      klass.name
                  } instance`,
              ),
    );
}

/**
 * Lazily evaluate the given decoder. This is useful to build self-referential
 * types for recursive data structures.
 */
export function lazy<T>(decoderFn: () => Decoder<T>): Decoder<T> {
    return define((blob) => decoderFn().decode(blob));
}

/**
 * Pre-process the data input before passing it into the decoder. This gives
 * you the ability to arbitrarily customize the input on the fly before passing
 * it to the decoder. Of course, the input value at that point is still of
 * ``unknown`` type, so you will have to deal with that accordingly.
 */
export function prep<T>(mapperFn: (mixed) => mixed, decoder: Decoder<T>): Decoder<T> {
    return define((originalInput, _, err) => {
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

/**
 * Rejects all inputs, and always fails with the given error message. May be
 * useful for explicitly disallowing keys, or for testing purposes.
 */
export function never(msg: string): Decoder<empty> {
    return define((_, __, err) => err(msg));
}

/**
 * Alias of never().
 */
export const fail: (msg: string) => Decoder<empty> = never;
