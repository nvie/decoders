// @flow

import { annotate } from 'debrief';
import { Err } from 'lemons';

import type { Decoder } from './types';

/**
 * Decoder that always fails with the given error message, no matter what the input.
 */
export function fail<T>(msg: string): Decoder<T> {
    return (blob: any) => Err(annotate(blob, msg));
}
