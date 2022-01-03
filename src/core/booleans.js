// @flow strict

import { annotate } from '../annotate';
import { define } from '../_decoder';
import { err, ok } from '../result';
import { number } from './numbers';
import type { Decoder } from '../_decoder';

/**
 * Accepts and returns booleans.
 */
export const boolean: Decoder<boolean> = define((blob) => {
    return typeof blob === 'boolean' ? ok(blob) : err(annotate(blob, 'Must be boolean'));
});

/**
 * Accepts anything and will return its “truth” value. Will never reject.
 */
export const truthy: Decoder<boolean> = define((blob) => ok(!!blob));

/**
 * Accepts numbers, but return their boolean representation.
 */
export const numericBoolean: Decoder<boolean> = number.transform((n) => !!n);
