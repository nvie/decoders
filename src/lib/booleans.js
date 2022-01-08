// @flow strict

import { define } from '../_decoder';
import { number } from './numbers';
import type { Decoder } from '../_decoder';

/**
 * Accepts and returns booleans.
 */
export const boolean: Decoder<boolean> = define((blob, accept, reject) => {
    return typeof blob === 'boolean' ? accept(blob) : reject('Must be boolean');
});

/**
 * Accepts anything and will return its “truth” value. Will never reject.
 */
export const truthy: Decoder<boolean> = define((blob, accept) => accept(!!blob));

/**
 * Accepts numbers, but return their boolean representation.
 */
export const numericBoolean: Decoder<boolean> = number.transform((n) => !!n);
