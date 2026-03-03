import { partition } from 'itertools';
import { describe, expect, test } from 'vitest';

import {
  anyNumber,
  between,
  bigint,
  integer,
  max,
  min,
  number,
  positiveInteger,
  positiveNumber,
} from '~';

import { INPUTS } from './_fixtures';

describe('number', () => {
  const decoder = number;
  const [okay, not_okay] = partition(INPUTS, (n) => Number.isFinite(n));

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

describe('anyNumber', () => {
  const decoder = anyNumber;
  const [okay, not_okay] = partition(INPUTS, (n) => typeof n === 'number');

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

describe('positiveNumber', () => {
  const decoder = positiveNumber;
  const [okay, not_okay] = partition(
    INPUTS,
    (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0,
  );

  test('valid', () => {
    expect(okay.length).not.toBe(0);
    for (const value of okay) {
      expect(decoder.verify(value)).toBe(value === 0 ? 0 : value);
      expect(decoder.verify(value)).not.toBe(-0);
    }
  });

  test('rejects -0', () => {
    expect(decoder.decode(0).ok).toBe(true);
    expect(decoder.decode(-0).ok).toBe(false);
  });

  test('invalid', () => {
    expect(not_okay.length).not.toBe(0);
    for (const value of not_okay) {
      expect(decoder.decode(value).ok).toBe(false);
    }
  });
});

describe('integer', () => {
  const decoder = integer;
  const [okay, not_okay] = partition(INPUTS, (n) => Number.isInteger(n));

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

describe('positiveInteger', () => {
  const decoder = positiveInteger;
  const [okay, not_okay] = partition(
    INPUTS,
    (n) => typeof n === 'number' && Number.isInteger(n) && n >= 0,
  );

  test('valid', () => {
    expect(okay.length).not.toBe(0);
    for (const value of okay) {
      expect(decoder.verify(value)).toBe(value === 0 ? 0 : value);
      expect(decoder.verify(value)).not.toBe(-0);
    }
  });

  test('rejects -0', () => {
    expect(decoder.decode(0).ok).toBe(true);
    expect(decoder.decode(-0).ok).toBe(false);
  });

  test('invalid', () => {
    expect(not_okay.length).not.toBe(0);
    for (const value of not_okay) {
      expect(decoder.decode(value).ok).toBe(false);
    }
  });
});

describe('min', () => {
  test('inclusive lower bound', () => {
    const decoder = min(0);
    expect(decoder.verify(0)).toBe(0);
    expect(decoder.verify(999)).toBe(999);
    expect(() => decoder.verify(-1)).toThrow('Must be at least 0');
  });

  test('works with other number decoders', () => {
    const decoder = min(1, integer);
    expect(decoder.verify(1)).toBe(1);
    expect(() => decoder.verify(0)).toThrow('Must be at least 1');
    expect(() => decoder.verify(3.5)).toThrow('Number must be an integer');
  });

  test('rejects non-numbers', () => {
    expect(() => min(0).verify('5')).toThrow('Must be number');
  });
});

describe('max', () => {
  test('inclusive upper bound', () => {
    const decoder = max(100);
    expect(decoder.verify(-999)).toBe(-999);
    expect(decoder.verify(100)).toBe(100);
    expect(() => decoder.verify(101)).toThrow('Must be at most 100');
  });

  test('works with other number decoders', () => {
    const decoder = max(10, integer);
    expect(decoder.verify(10)).toBe(10);
    expect(() => decoder.verify(11)).toThrow('Must be at most 10');
    expect(() => decoder.verify(3.5)).toThrow('Number must be an integer');
  });

  test('rejects non-numbers', () => {
    expect(() => max(10).verify('5')).toThrow('Must be number');
  });
});

describe('between', () => {
  test('inclusive bounds', () => {
    const decoder = between(2, 5);
    expect(decoder.verify(2)).toBe(2);
    expect(decoder.verify(3.5)).toBe(3.5);
    expect(decoder.verify(5)).toBe(5);
    expect(() => decoder.verify(1)).toThrow('Must be at least 2');
    expect(() => decoder.verify(6)).toThrow('Must be at most 5');
  });

  test('works with other number decoders', () => {
    const decoder = between(1, 10, integer);
    expect(decoder.verify(1)).toBe(1);
    expect(decoder.verify(10)).toBe(10);
    expect(() => decoder.verify(0)).toThrow('Must be at least 1');
    expect(() => decoder.verify(3.5)).toThrow('Number must be an integer');
  });

  test('rejects non-numbers', () => {
    expect(() => between(0, 10).verify('5')).toThrow('Must be number');
  });
});

describe('bigint', () => {
  const decoder = bigint;
  const [okay, not_okay] = partition(INPUTS, (n) => typeof n === 'bigint');

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
