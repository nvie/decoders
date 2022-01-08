// @flow strict

import { annotate } from '../annotate';
import { define } from '../_decoder';
import { err } from '../result';
import type { Decoder } from '../_decoder';

/**
 * Pre-process the data input before passing it into the decoder. This gives
 * you the ability to arbitrarily customize the input on the fly before passing
 * it to the decoder. Of course, the input value at that point is still of
 * `unknown` type, so you will have to deal with that accordingly.
 */
export function prep<T>(mapperFn: (mixed) => mixed, decoder: Decoder<T>): Decoder<T> {
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
