import type { Decoder } from '~/core/index.js';
import { define } from '~/core/index.js';

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
