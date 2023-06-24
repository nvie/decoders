// @flow strict

import { define } from '../Decoder';
import { number } from './numbers';
import type { Decoder } from '../Decoder';

/**
 * Accepts and returns booleans.
 */
export const boolean: Decoder<boolean> = define((blob, ok, err) => {
    return typeof blob === 'boolean' ? ok(blob) : err('Must be boolean');
});

/**
 * Accepts anything and will return its "truth" value. Will never reject.
 */
export const truthy: Decoder<boolean> = define((blob, ok, _) => ok(!!blob));

/**
 * Accepts numbers, but return their boolean representation.
 */
export const numericBoolean: Decoder<boolean> = number.transform((n) => !!n);
