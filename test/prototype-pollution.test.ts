import { describe, expect, test } from 'vitest';

import type { Decoder } from '~';
import { inexact, mapping, record, string, unknown } from '~';

/**
 * These tests assert the *harm* is unreachable, not which policy prevents it.
 * A decoder may reject the input or drop the key -- either is fine. What must
 * never happen is a decoded value that exposes attacker-controlled properties,
 * or one that can reach `Object.prototype` from ordinary downstream code.
 *
 * This file only uses the public API, so it can be dropped into any checkout to
 * find out whether that version is vulnerable.
 */

// Attack payloads must be built with JSON.parse: in an object literal
// `__proto__` sets the prototype instead of defining a key, so a literal cannot
// express these at all.
const ATTACK = '{"theme":"dark","__proto__":{"isAdmin":true}}';

// Assigning `__proto__` fires the inherited setter, which consumes one level of
// nesting, so reaching `Object.prototype` downstream takes one level more.
const NESTED_ATTACK = '{"theme":"dark","__proto__":{"__proto__":{"polluted":true}}}';

/** A textbook deep merge -- the shape found in a great deal of config code. */
const isObj = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object' && !Array.isArray(x);

function deepMerge(
  target: Record<string, unknown>,
  src: Record<string, unknown>,
): Record<string, unknown> {
  for (const key in src) {
    const s = src[key];
    const t = target[key];
    if (isObj(s) && isObj(t)) {
      deepMerge(t, s);
    } else {
      target[key] = s;
    }
  }
  return target;
}

/**
 * What a caller can actually observe on a decoded value. `mapping()` returns a
 * Map, so compare its entries rather than the Map instance itself.
 */
function observable(value: unknown): Record<string, unknown> {
  return value instanceof Map
    ? Object.fromEntries(value)
    : (value as Record<string, unknown>);
}

/** Decodes, treating a rejection as a safe (inert) outcome. */
function decodeOrInert(decoder: Decoder<unknown>, payload: string) {
  const result = decoder.decode(JSON.parse(payload));
  return result.ok ? observable(result.value) : {};
}

const subjects: [string, Decoder<unknown>][] = [
  ['inexact()', inexact({ theme: string })],
  ['record()', record(unknown)],
  ['mapping()', mapping(unknown)],
];

describe('prototype pollution', () => {
  describe.each(subjects)('%s', (_name, decoder) => {
    test('a decoded value never inherits attacker-controlled properties', () => {
      expect(Object.getPrototypeOf(decodeOrInert(decoder, ATTACK))).toBe(
        Object.prototype,
      );
    });

    test('a decoded value never reports properties it does not own', () => {
      const value = decodeOrInert(decoder, ATTACK);
      expect(value.isAdmin).toBeUndefined();
      expect('isAdmin' in value).toBe(false);
    });

    test('a decoded value cannot reach Object.prototype through a deep merge', () => {
      try {
        deepMerge({ theme: 'light' }, decodeOrInert(decoder, NESTED_ATTACK));

        expect(({} as Record<string, unknown>).polluted).toBeUndefined();
        expect(([] as unknown as Record<string, unknown>).polluted).toBeUndefined();
      } finally {
        // Never let a failure here leak into the rest of the suite
        Reflect.deleteProperty(Object.prototype, 'polluted');
      }
    });
  });
});
