// @flow strict

import { annotate } from 'debrief';
import { Err } from 'lemons/Result';

import type { Decoder } from './types';

/**
 * Decoder that always fails with the given error message, no matter what the input.
 */
export function fail<T>(msg: string): Decoder<T> {
    return (blob: mixed) => Err(annotate(blob, msg));
}
