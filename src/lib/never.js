// @flow strict

import { annotate } from '../annotate';
import { define } from '../_decoder';
import { err } from '../result';
import type { Decoder } from '../_decoder';

/**
 * Decoder that always fails with the given error message, no matter what the input.
 */
export function never(msg: string): Decoder<empty> {
    return define((blob) => err(annotate(blob, msg)));
}

/**
 * Alias of never().
 */
export const fail: (string) => Decoder<empty> = never;
