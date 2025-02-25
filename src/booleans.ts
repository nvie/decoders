import type { Decoder } from '~/core';
import { define } from '~/core';

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
