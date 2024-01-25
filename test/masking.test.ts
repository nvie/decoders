import { partition } from 'itertools';
import { describe, expect, test } from 'vitest';

import { masked } from '~/core';
import { string } from '~/strings';
import { object } from '~/objects';

import { INPUTS } from './_fixtures';

// XXX Also test with other containers, not just object()
// - exact()
// - inexact()
// - either()
// - array()
// - record
// - mapping
// - setFromArray()

// XXX For inexact(), is there a way to specify that all extra fields should
// match a specific decoder? And if so, could we mask() that one?

describe("scalar values that are masked won't echo back their inputs when invalid", () => {
  describe('with default mask', () => {
    const decoder = masked(string);
    const [okay, not_okay] = partition(INPUTS, (x) => typeof x === 'string');

    test('valid', () => {
      expect(okay.length).not.toBe(0);
      for (const value of okay) {
        expect(decoder.verify(value)).toBe(value);
      }
    });

    test('invalid', () => {
      expect(not_okay.length).not.toBe(0);
      for (const value of not_okay) {
        expect(() => decoder.verify(value)).toThrow(`
<masked>
^^^^^^^^ Must be string`);
      }
    });
  });

  describe('with custom mask string', () => {
    const decoder = masked(string, '🙈');
    const [okay, not_okay] = partition(INPUTS, (x) => typeof x === 'string');

    test('valid', () => {
      expect(okay.length).not.toBe(0);
      for (const value of okay) {
        expect(decoder.verify(value)).toBe(value);
      }
    });

    test('invalid', () => {
      expect(not_okay.length).not.toBe(0);
      for (const value of not_okay) {
        expect(() => decoder.verify(value)).toThrow(`
🙈
^^ Must be string`);
      }
    });
  });
});

describe("objects with masked fields won't echo back their inputs when invalid", () => {
  describe('with default mask', () => {
    const decoder = object({
      username: string,
      password: masked(string),
    });
    const valid = { username: 'nvie', password: 'password123' };
    const invalid = { username: 'nvie', password: 8972349894792 };

    test('valid', () => {
      expect(decoder.verify(valid)).toEqual(valid);
    });

    test('invalid', () => {
      expect(() => decoder.verify(invalid)).toThrow(`
{
  "username": "nvie",
  "password": <masked>,
              ^^^^^^^^ Must be string
}`);
    });
  });

  describe('with custom mask string', () => {
    const decoder = object({
      username: string,
      password: masked(string, '***REDACTED***'),
    });
    const valid = { username: 'nvie', password: 'password123' };
    const invalid = { username: 'nvie', password: 8972349894792 };

    test('valid', () => {
      expect(decoder.verify(valid)).toEqual(valid);
    });

    test('invalid', () => {
      expect(() => decoder.verify(invalid)).toThrow(`
{
  "username": "nvie",
  "password": ***REDACTED***,
              ^^^^^^^^^^^^^^ Must be string
}`);
    });
  });
});

describe("objects with masked fields won't echo back their inputs when *other fields* are invalid", () => {
  const decoder = object({
    username: string,
    password: masked(string, 'XXXXXX'),
  });
  const valid = { username: 'nvie', password: 'password123' };
  const invalid = { username: 123, password: 'password123' };

  test('valid', () => {
    expect(decoder.verify(valid)).toEqual(valid);
  });

  test('invalid', () => {
    expect(() => decoder.verify(invalid)).toThrow(`
{
  "username": 123,
              ^^^ Must be string
  "password": XXXXXX,
}`);
  });
});
