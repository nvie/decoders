import { partition } from 'itertools';
import { describe, expect, test } from 'vitest';

import {
  anyNumber,
  bigint,
  integer,
  number,
  positiveInteger,
  positiveNumber,
} from '~/numbers';

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

  test('readonliness', () => {
    expect(decoder.isReadonly).toBe(true);
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

  test('readonliness', () => {
    expect(decoder.isReadonly).toBe(true);
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

  test('readonliness', () => {
    expect(decoder.isReadonly).toBe(true);
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

  test('readonliness', () => {
    expect(decoder.isReadonly).toBe(true);
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

  test('readonliness', () => {
    expect(decoder.isReadonly).toBe(true);
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

  test('readonliness', () => {
    expect(decoder.isReadonly).toBe(true);
  });
});
