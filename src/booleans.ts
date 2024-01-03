import type { Decoder } from '~/core';
import { define } from '~/core';

import { number } from './numbers';

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
