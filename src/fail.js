// @flow strict

import { annotate } from 'debrief';
import { Err } from 'lemons/Result';

import type { Decoder } from './types';

/**
 * Decoder that always fails with the given error message, no matter what the input.
 */
export function fail(msg: string): Decoder<empty> {
    return (blob: mixed) => Err(annotate(blob, msg));
}
