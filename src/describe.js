// @flow strict

import { annotate } from 'debrief';

import type { Decoder } from './types';

/**
 * Wrap another decoder, and override the error message in case it fails. This
 * is useful to "simplify" otherwise potentially complex error messages, or to
 * use language in those error messages that can be relayed to end users (for
 * example to show in form errors).
 */
export function describe<T>(decoder: Decoder<T>, message: string): Decoder<T> {
    return (blob: mixed) => {
        return decoder(blob).mapError((err) => annotate(err, message));
    };
}
