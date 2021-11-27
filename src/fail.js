// @flow strict

import * as Result from './core/Result';
import { annotate } from './core/Annotation';
import type { Decoder } from './types';

/**
 * Decoder that always fails with the given error message, no matter what the input.
 */
export function fail(msg: string): Decoder<empty> {
    return (blob: mixed) => Result.err(annotate(blob, msg));
}
