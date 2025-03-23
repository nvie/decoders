import { partition } from 'itertools';
import { describe, expect, test } from 'vitest';

import {
  always,
  constant,
  fail,
  maybe,
  never,
  null_,
  nullable,
  nullish,
  optional,
  undefined_,
  unknown,
} from '~/basics';
import { string } from '~/strings';

import { INPUTS } from './_fixtures';

describe('null_', () => {
  const decoder = null_;
  expect(decoder.isReadonly).toBe(true);
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
  expect(decoder.isReadonly).toBe(true);
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
  expect(decoder.isReadonly).toBe(true);
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
      expect(decoder.decode(value).error?.text).toEqual("Must be 'foo'");
    }
  });
});

describe('number constants', () => {
  const decoder = constant(42);
  const [okay, not_okay] = partition(INPUTS, (x) => x === 42);
  expect(decoder.isReadonly).toBe(true);

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
  expect(decoder.isReadonly).toBe(true);
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
  expect(decoder.isReadonly).toBe(true);
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

describe('symbol constants', () => {
  const sym1 = Symbol.for('xyz1');
  const sym2 = Symbol('xyz2');
  const sym3 = Symbol('xyz3');
  const sym4 = Symbol();

  const decoder = constant(sym2);
  expect(decoder.isReadonly).toBe(true);
  const [okay, not_okay] = partition([...INPUTS, sym1, sym2, sym3, sym4], (x) =>
    ([sym2] as unknown[]).includes(x),
  );

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
      expect(decoder.decode(value).error?.text).toMatch(/^Must be Symbol\(xyz2\)$/);
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
      expect(decoder.isReadonly).toBe(false);

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
    expect(decoder.isReadonly).toBe(true);

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
  expect(decoder.isReadonly).toBe(true);
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
    expect(decoder.isReadonly).toBe(false);
    expect(decoder.verify('foo')).toBe('foo');
    expect(decoder.verify('')).toBe('');
    expect(decoder.verify(undefined)).toBe(42);

    expect(() => decoder.verify(null)).toThrow();
    expect(() => decoder.verify(123)).toThrow();
  });

  test('w/ callable default value', () => {
    const decoder = optional(string, () => 42);
    expect(decoder.isReadonly).toBe(false);
    expect(decoder.verify('foo')).toBe('foo');
    expect(decoder.verify('')).toBe('');
    expect(decoder.verify(undefined)).toBe(42);

    expect(() => decoder.verify(null)).toThrow();
    expect(() => decoder.verify(123)).toThrow();
  });
});

describe('nullable', () => {
  const decoder = nullable(string);
  expect(decoder.isReadonly).toBe(true);
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
    expect(decoder.isReadonly).toBe(false);
    expect(decoder.verify('foo')).toBe('foo');
    expect(decoder.verify('')).toBe('');
    expect(decoder.verify(null)).toBe(42);

    expect(() => decoder.verify(undefined)).toThrow();
    expect(() => decoder.verify(123)).toThrow();
  });

  test('w/ callable default value', () => {
    const decoder = nullable(string, () => 42);
    expect(decoder.isReadonly).toBe(false);
    expect(decoder.verify('foo')).toBe('foo');
    expect(decoder.verify('')).toBe('');
    expect(decoder.verify(null)).toBe(42);

    expect(() => decoder.verify(undefined)).toThrow();
    expect(() => decoder.verify(123)).toThrow();
  });
});

describe('maybe', () => {
  const decoder = maybe(string);
  expect(decoder.isReadonly).toBe(true);
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
    const decoder = nullish(string, 42);
    expect(decoder.isReadonly).toBe(false);
    expect(decoder.verify('foo')).toBe('foo');
    expect(decoder.verify('')).toBe('');
    expect(decoder.verify(null)).toBe(42);
    expect(decoder.verify(undefined)).toBe(42);

    expect(() => decoder.verify(123)).toThrow();
  });

  test('w/ callable default value', () => {
    const decoder = nullish(string, () => 42);
    expect(decoder.isReadonly).toBe(false);
    expect(decoder.verify('foo')).toBe('foo');
    expect(decoder.verify('')).toBe('');
    expect(decoder.verify(null)).toBe(42);
    expect(decoder.verify(undefined)).toBe(42);

    expect(() => decoder.verify(123)).toThrow();
  });
});

describe('nullish', () => {
  const decoder = nullish(string);
  expect(decoder.isReadonly).toBe(true);
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
    const decoder = nullish(string, 42);
    expect(decoder.isReadonly).toBe(false);
    expect(decoder.verify('foo')).toBe('foo');
    expect(decoder.verify('')).toBe('');
    expect(decoder.verify(null)).toBe(42);
    expect(decoder.verify(undefined)).toBe(42);

    expect(() => decoder.verify(123)).toThrow();
  });

  test('w/ callable default value', () => {
    const decoder = nullish(string, () => 42);
    expect(decoder.isReadonly).toBe(false);
    expect(decoder.verify('foo')).toBe('foo');
    expect(decoder.verify('')).toBe('');
    expect(decoder.verify(null)).toBe(42);
    expect(decoder.verify(undefined)).toBe(42);

    expect(() => decoder.verify(123)).toThrow();
  });
});

describe('fail', () => {
  const decoder = fail('I always fail');
  expect(decoder.isReadonly).toBe(true);
  const not_okay = INPUTS;

  test('accepts nothing', () => {
    // Nothing is valid for a failing decoder :)
  });

  test('rejects everything', () => {
    expect(not_okay.length).not.toBe(0);
    for (const value of not_okay) {
      expect(decoder.decode(value).ok).toBe(false);
    }
  });
});

describe('never', () => {
  const decoder = never('I always fail');
  expect(decoder.isReadonly).toBe(true);
  const not_okay = INPUTS;

  test('accepts nothing', () => {
    // Nothing is valid for a failing decoder :)
  });

  test('rejects everything', () => {
    expect(not_okay.length).not.toBe(0);
    for (const value of not_okay) {
      expect(decoder.decode(value).ok).toBe(false);
    }
  });
});
