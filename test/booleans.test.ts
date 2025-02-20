import { partition } from 'itertools';
import { describe, expect, test } from 'vitest';

import { boolean, truthy } from '~/booleans.js';

import { INPUTS } from './_fixtures.js';

describe('booleans', () => {
  const decoder = boolean;
  const [okay, not_okay] = partition(INPUTS, (x) => x === true || x === false);

  test('valid', () => {
    expect(okay.length).not.toBe(0);
    for (const value of okay) {
      expect(decoder.verify(value)).toBe(value);
    }
  });

  test('invalid', () => {
    expect(not_okay.length).not.toBe(0);
    for (const value of not_okay) {
      expect(decoder.decode(value).ok).toBe(false);
    }
  });
});

describe('truthy', () => {
  const decoder = truthy;
  const okay = INPUTS;

  test('valid', () => {
    expect(okay.length).not.toBe(0);
    for (const value of okay) {
      expect(decoder.verify(value)).toBe(!!value);
    }
  });

  test('invalid', () => {
    // truthy never fails
  });
});
