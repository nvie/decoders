import { describe, expect, test } from 'vitest';
import {
  always,
  constant,
  maybe,
  nullable,
  null_,
  optional,
  undefined_,
  unknown,
} from '~/lib/basics';
import { INPUTS } from './_fixtures';
import { partition } from 'itertools';
import { string } from '~/lib/strings';

describe('null_', () => {
  const decoder = null_;
  const [okay, not_okay] = partition(INPUTS, (x) => x === null);

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
      expect(decoder.decode(value).error?.text).toEqual('Must be null');
    }
  });
});

describe('undefined_', () => {
  const decoder = undefined_;
  const [okay, not_okay] = partition(INPUTS, (x) => x === undefined);

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
      expect(decoder.decode(value).error?.text).toEqual('Must be undefined');
    }
  });
});

describe('string constants', () => {
  const decoder = constant('foo');
  const [okay, not_okay] = partition(INPUTS, (x) => x === 'foo');

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
      expect(decoder.decode(value).error?.text).toEqual('Must be "foo"');
    }
  });
});

describe('number constants', () => {
  const decoder = constant(42);
  const [okay, not_okay] = partition(INPUTS, (x) => x === 42);

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
      expect(decoder.decode(value).error?.text).toEqual('Must be 42');
    }
  });
});

describe('boolean constants #1', () => {
  const decoder = constant(true);
  const [okay, not_okay] = partition(INPUTS, (x) => x === true);

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
      expect(decoder.decode(value).error?.text).toEqual('Must be true');
    }
  });
});

describe('boolean constants #2', () => {
  const decoder = constant(false);
  const [okay, not_okay] = partition(INPUTS, (x) => x === false);

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
      expect(decoder.decode(value).error?.text).toEqual('Must be false');
    }
  });
});

describe('always', () => {
  test('valid', () => {
    // Test all hardcoded inputs...
    for (const hardcodedValue of INPUTS) {
      if (Number.isNaN(hardcodedValue)) {
        // Skip NaN, as we can't compare those for our test cases...
        continue;
      }

      const decoder = always(hardcodedValue);

      // Against all inputs...
      for (const input of INPUTS) {
        expect(decoder.verify(input)).toBe(hardcodedValue);
      }
    }
  });

  test('works with callables', () => {
    const now = new Date();
    expect(always(() => 42).verify('dummy')).toBe(42);
    expect(always(() => now).verify('dummy')).toBe(now);
  });

  test('invalid', () => {
    // hardcoded verifiers never fail
  });
});

describe('mixed (pass-thru)', () => {
  test('valid', () => {
    // Test all hardcoded inputs...
    const decoder = unknown;

    // Against all inputs...
    for (const input of INPUTS) {
      expect(decoder.verify(input)).toBe(input);
    }
  });

  test('mixed', () => {
    // mixed verifiers never fail
  });
});

describe('optional', () => {
  const decoder = optional(string);
  const [okay, not_okay] = partition(INPUTS, (x) => typeof x === 'string');

  test('valid', () => {
    expect(okay.length).not.toBe(0);
    expect(decoder.verify(undefined)).toBe(undefined);
    for (const value of okay) {
      expect(decoder.verify(value)).toBe(value);
    }
  });

  test('invalid', () => {
    expect(not_okay.length).not.toBe(0);
    for (const value of not_okay) {
      if (value === undefined) continue;
      expect(decoder.decode(value).ok).toBe(false);
    }
  });

  test('w/ default value', () => {
    const decoder = optional(string, 42);
    expect(decoder.verify('foo')).toBe('foo');
    expect(decoder.verify('')).toBe('');
    expect(decoder.verify(undefined)).toBe(42);

    expect(() => decoder.verify(null)).toThrow();
    expect(() => decoder.verify(123)).toThrow();
  });

  test('w/ callable default value', () => {
    const decoder = optional(string, () => 42);
    expect(decoder.verify('foo')).toBe('foo');
    expect(decoder.verify('')).toBe('');
    expect(decoder.verify(undefined)).toBe(42);

    expect(() => decoder.verify(null)).toThrow();
    expect(() => decoder.verify(123)).toThrow();
  });
});

describe('nullable', () => {
  const decoder = nullable(string);
  const [okay, not_okay] = partition(INPUTS, (x) => typeof x === 'string');

  test('valid', () => {
    expect(okay.length).not.toBe(0);
    expect(decoder.verify(null)).toBe(null);
    for (const value of okay) {
      expect(decoder.verify(value)).toBe(value);
    }
  });

  test('invalid', () => {
    expect(not_okay.length).not.toBe(0);
    for (const value of not_okay) {
      if (value === null) continue;
      expect(decoder.decode(value).ok).toBe(false);
    }
  });

  test('w/ default value', () => {
    const decoder = nullable(string, 42);
    expect(decoder.verify('foo')).toBe('foo');
    expect(decoder.verify('')).toBe('');
    expect(decoder.verify(null)).toBe(42);

    expect(() => decoder.verify(undefined)).toThrow();
    expect(() => decoder.verify(123)).toThrow();
  });

  test('w/ callable default value', () => {
    const decoder = nullable(string, () => 42);
    expect(decoder.verify('foo')).toBe('foo');
    expect(decoder.verify('')).toBe('');
    expect(decoder.verify(null)).toBe(42);

    expect(() => decoder.verify(undefined)).toThrow();
    expect(() => decoder.verify(123)).toThrow();
  });
});

describe('maybe', () => {
  const decoder = maybe(string);
  const [okay, not_okay] = partition(INPUTS, (x) => typeof x === 'string');

  test('valid', () => {
    expect(okay.length).not.toBe(0);
    expect(decoder.verify(null)).toBe(null);
    expect(decoder.verify(undefined)).toBe(undefined);
    for (const value of okay) {
      expect(decoder.verify(value)).toBe(value);
    }
  });

  test('allowNull', () => {
    // No difference when decoding undefined
    expect(decoder.verify(undefined)).toBeUndefined();
    expect(decoder.verify(null)).toBeNull();

    // No difference when string-decoding
    expect(decoder.verify('')).toBe('');
    expect(decoder.verify('foo')).toBe('foo');
  });

  test('invalid', () => {
    expect(not_okay.length).not.toBe(0);
    for (const value of not_okay) {
      if (value === undefined) continue;
      if (value === null) continue;
      expect(decoder.decode(value).ok).toBe(false);
    }
  });

  test('w/ default value', () => {
    const decoder = maybe(string, 42);
    expect(decoder.verify('foo')).toBe('foo');
    expect(decoder.verify('')).toBe('');
    expect(decoder.verify(null)).toBe(42);
    expect(decoder.verify(undefined)).toBe(42);

    expect(() => decoder.verify(123)).toThrow();
  });

  test('w/ callable default value', () => {
    const decoder = maybe(string, () => 42);
    expect(decoder.verify('foo')).toBe('foo');
    expect(decoder.verify('')).toBe('');
    expect(decoder.verify(null)).toBe(42);
    expect(decoder.verify(undefined)).toBe(42);

    expect(() => decoder.verify(123)).toThrow();
  });
});
