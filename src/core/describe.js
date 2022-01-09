// @flow strict

import { annotate } from '../annotate';
import { define } from '../_decoder';
import { err } from '../result';
import type { Decoder } from '../_decoder';

/**
 * Wrap another decoder, and override the error message in case it fails. This
 * is useful to "simplify" otherwise potentially complex error messages, or to
 * use language in those error messages that can be relayed to end users (for
 * example to show in form errors).
 */
export function describe<T>(decoder: Decoder<T>, message: string): Decoder<T> {
    return define((blob) => {
        // Decode using the given decoder...
        const result = decoder.decode(blob);
        if (result.ok) {
            return result;
        } else {
            // ...but in case of error, annotate this with the custom given
            // message instead
            return err(annotate(result.error, message));
        }
    });
}
