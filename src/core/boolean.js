// @flow strict

import { annotate } from '../annotate';
import { define } from '../_decoder';
import { err, ok } from '../result';
import { number } from './number';
import { transform } from './composition';
import type { Decoder } from '../_decoder';

/**
 * Decoder that only returns Ok for boolean inputs.  Err otherwise.
 */
export const boolean: Decoder<boolean> = define((blob) => {
    return typeof blob === 'boolean' ? ok(blob) : err(annotate(blob, 'Must be boolean'));
});

/**
 * Decoder that returns true for all truthy values, and false otherwise.  Never fails.
 */
export const truthy: Decoder<boolean> = define((blob) => ok(!!blob));

/**
 * Decoder that only returns Ok for numeric input values representing booleans.
 * Returns their boolean representation.  Err otherwise.
 */
export const numericBoolean: Decoder<boolean> = transform(number, (n) => !!n);
