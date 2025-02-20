import { describe, expect, test } from 'vitest';

import { array } from '~/arrays.js';
import { number } from '~/numbers.js';
import { exact, object } from '~/objects.js';
import { string } from '~/strings.js';
import { either } from '~/unions.js';

describe('standard-schema', () => {
  test('valid', async () => {
    const schema = string;
    const result = await schema['~standard'].validate("I'm a string");
    if (result.issues) {
      expect.unreachable('Expected no issues');
    }

    expect(result.value).toEqual("I'm a string");
  });

  test('invalid', async () => {
    const schema = string;
    const result = await schema['~standard'].validate(42);
    expect(result.issues).toEqual([{ message: 'Must be string' }]);
  });

  test('invalid (nesting with array paths)', async () => {
    const schema = array(exact({ a: string }));

    expect((await schema['~standard'].validate(42)).issues).toEqual([
      { message: 'Must be an array' },
    ]);

    expect((await schema['~standard'].validate([{ a: '' }, 42, 42])).issues).toEqual([
      { message: 'Must be an object (at index 1)', path: [1] },
    ]);

    expect((await schema['~standard'].validate([{}, {}])).issues).toEqual([
      { message: "Missing key: 'a' (at index 0)", path: [0] },
    ]);
  });

  test('invalid (nesting)', async () => {
    const schema = object({
      a: object({
        b: exact({
          c: string,
        }),
      }),
    });

    expect(
      (await schema['~standard'].validate({ b: { b: { c: 'hi' } } })).issues,
    ).toEqual([{ message: "Missing key: 'a'" }]);

    expect((await schema['~standard'].validate({ a: { b: 42 } })).issues).toEqual([
      { message: 'Must be an object', path: ['a', 'b'] },
    ]);

    expect((await schema['~standard'].validate({ a: { b: 42 } })).issues).toEqual([
      { message: 'Must be an object', path: ['a', 'b'] },
    ]);

    expect((await schema['~standard'].validate({ a: { b: { c: 42 } } })).issues).toEqual([
      { message: 'Must be string', path: ['a', 'b', 'c'] },
    ]);

    expect(
      (await schema['~standard'].validate({ a: { b: { c: 'hi', d: 'hi' } } })).issues,
    ).toEqual([{ message: "Unexpected extra keys: 'd'", path: ['a', 'b'] }]);

    expect((await schema['~standard'].validate({ a: { b: {} } })).issues).toEqual([
      { message: "Missing key: 'c'", path: ['a', 'b'] },
    ]);
  });

  test('invalid (nesting)', async () => {
    const schema = object({
      a: object({
        b: exact({
          c: string,
        }),
      }),
    });

    expect(
      (await schema['~standard'].validate({ b: { b: { c: 'hi' } } })).issues,
    ).toEqual([{ message: "Missing key: 'a'" }]);

    expect((await schema['~standard'].validate({ a: { b: 42 } })).issues).toEqual([
      { message: 'Must be an object', path: ['a', 'b'] },
    ]);

    expect((await schema['~standard'].validate({ a: { b: 42 } })).issues).toEqual([
      { message: 'Must be an object', path: ['a', 'b'] },
    ]);

    expect((await schema['~standard'].validate({ a: { b: { c: 42 } } })).issues).toEqual([
      { message: 'Must be string', path: ['a', 'b', 'c'] },
    ]);

    expect(
      (await schema['~standard'].validate({ a: { b: { c: 'hi', d: 'hi' } } })).issues,
    ).toEqual([{ message: "Unexpected extra keys: 'd'", path: ['a', 'b'] }]);

    expect((await schema['~standard'].validate({ a: { b: {} } })).issues).toEqual([
      { message: "Missing key: 'c'", path: ['a', 'b'] },
    ]);
  });

  test('invalid (branches)', async () => {
    const schema = object({
      a: either(object({ foo: string }), object({ bar: number })),
    });

    const result = await schema['~standard'].validate({
      a: {
        foo: 42,
        bar: 'hi',
      },
    });

    // Branching cannot be elegantly handled with a single flat list of issues
    expect(result.issues).toEqual([
      {
        message:
          "Either:\n- Value at key 'foo': Must be string\n- Value at key 'bar': Must be number",
        path: ['a'],
      },
    ]);
  });
});
