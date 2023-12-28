/* eslint-disable no-restricted-syntax */

import { describe, expect, test } from 'vitest';
import {
  anyNumber,
  integer,
  number,
  positiveInteger,
  positiveNumber,
} from '~/lib/numbers';
import { INPUTS } from './_fixtures';
import { partition } from 'itertools';

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

  test('invalid', () => {
    expect(not_okay.length).not.toBe(0);
    for (const value of not_okay) {
      expect(decoder.decode(value).ok).toBe(false);
    }
  });
});
