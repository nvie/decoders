import type { Decoder, ReadonlyDecoder } from '~/core';
import { define, defineReadonly } from '~/core';

/**
 * Accepts and returns booleans.
 */
export const boolean: ReadonlyDecoder<boolean> = defineReadonly(
  (blob) => typeof blob === 'boolean',
  'Must be boolean',
);

/**
 * Accepts anything and will return its "truth" value. Will never reject.
 */
export const truthy: Decoder<boolean> = define((blob, ok, _) => ok(!!blob));
