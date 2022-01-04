// @flow strict

import { annotate } from '../annotate';
import { err } from '../result';
import type { Decoder } from '../_types';

/**
 * Decoder that always fails with the given error message, no matter what the input.
 */
export function never(msg: string): Decoder<empty> {
    return (blob: mixed) => err(annotate(blob, msg));
}

/**
 * Alias of never().
 */
export const fail: (string) => Decoder<empty> = never;
