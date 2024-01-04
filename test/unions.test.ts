import * as fc from 'fast-check';
import { partition } from 'itertools';
import { describe, expect, test } from 'vitest';

import { constant, optional, undefined_ } from '~/basics';
import { boolean } from '~/booleans';
import type { Decoder } from '~/core';
import { number } from '~/numbers';
import { object } from '~/objects';
import { regex, string } from '~/strings';
import { either, oneOf, select, taggedUnion } from '~/unions';

import { INPUTS } from './_fixtures';

// XXX Move into test utils
export function fuzz(testFn: (blob: unknown) => void) {
  return fc.assert(
    fc.property(
      fc.anything({
        withBigInt: true,
        withBoxedValues: true,
        withDate: true,
        withMap: true,
        withNullPrototype: true,
        withObjectString: true,
        withSet: true,
        withTypedArray: true,
        withSparseArray: true,
      }),
      testFn,
    ),
  );
}

describe('either', () => {
  const stringOrBooleanDecoder = either(string, boolean);
  const [okay, not_okay] = partition(
    INPUTS,
    (x) => typeof x === 'string' || typeof x === 'boolean',
  );

  test('valid', () => {
    expect(okay.length).not.toBe(0);
    for (const value of okay) {
      expect(stringOrBooleanDecoder.verify(value)).toBe(value);
    }
  });

  test('invalid', () => {
    expect(not_okay.length).not.toBe(0);
    for (const value of not_okay) {
      expect(() => stringOrBooleanDecoder.verify(value)).toThrow();
    }
  });

  test('errors nicely in trivial eithers', () => {
    expect(() => stringOrBooleanDecoder.verify(42)).toThrow('Either:');
  });

  test('errors nicely in common, simple eithers (ie optional)', () => {
    // Either undefined or string
    const d1 = either(undefined_, string);
    expect(() => d1.verify(42)).toThrow('Either:\n- Must be undefined\n- Must be string');
    expect(() => d1.verify({})).toThrow('Either:\n- Must be undefined\n- Must be string');

    // Either undefined or object
    const d2 = either(undefined_, object({ name: string }));
    expect(() => d2.verify(42)).toThrow(
      'Either:\n- Must be undefined\n- Must be an object',
    );
    expect(() => d2.verify({ name: 42 })).toThrow('Either');

    const d3 = either(regex(/1/, 'Must contain 1'), regex(/2/, 'Must contain 2'));
    expect(() => d3.verify(42)).toThrow('Either');
    expect(() => d3.verify('foobar')).toThrow('Either');
  });

  test('errors in complex eithers (with two wildly different branches)', () => {
    const decoder = either(object({ foo: string }), object({ bar: number }));
    expect(() =>
      decoder.verify({
        foo: 123,
        bar: 'not a number',
      }),
    ).toThrow(
      `{
  "foo": 123,
  "bar": "not a number",
}
^
Either:
- Value at key "foo": Must be string
- Value at key "bar": Must be number`,
    );
  });

  test('fuzz', () =>
    fuzz((blob) => {
      const expected = typeof blob === 'string' || typeof blob === 'boolean';
      expect(either(string, boolean).decode(blob).ok).toBe(expected);
    }));
});

test('nested eithers', () => {
  const decoder = either(either(string, boolean), either(number, undefined_));
  expect(() => decoder.verify(null)).toThrow(
    'Either:\n- Must be string\n- Must be boolean\n- Must be number\n- Must be undefined',
  );
});

test('either fails without decoders', () => {
  expect(() => either()).toThrow();
});

describe('either with 4 decoders', () => {
  const decoder = either(string, boolean, number, undefined_);
  const [okay, not_okay] = partition(
    INPUTS,
    (x) =>
      x === undefined ||
      typeof x === 'string' ||
      typeof x === 'boolean' ||
      Number.isFinite(x),
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
      expect(() => decoder.verify(value)).toThrow();
    }
  });
});

describe('either with many decoders', () => {
  const decoder = either(
    constant('one'),
    constant('two'),
    constant('three'),
    constant('four'),
    constant('five'),
    constant('six'),
    constant('seven'),
    constant('eight'),
    constant('nine'),
  );
  const okay = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const not_okay = INPUTS;

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

  test('fuzz', () =>
    fuzz((blob) => {
      const expected = okay.includes(blob as never);
      expect(decoder.decode(blob).ok).toBe(expected);
    }));
});

describe('oneOf', () => {
  const sym = Symbol();
  const decoder = oneOf([3, true, null, '1', 'foo', sym]);
  const okay = [3, true, null, '1', 'foo', sym];
  const not_okay = INPUTS.filter((x) => !okay.includes(x as any));

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

  test('fuzz', () =>
    fuzz((blob) => {
      const expected = okay.includes(blob as never);
      expect(decoder.decode(blob).ok).toBe(expected);
    }));
});

type Rectangle = {
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
};

type Circle = {
  type: 'circle';
  cx: number;
  cy: number;
  r: number;
};

const rectangle: Decoder<Rectangle> = object({
  type: constant('rectangle'),
  x: number,
  y: number,
  width: number,
  height: number,
});

const circle: Decoder<Circle> = object({
  type: constant('circle'),
  cx: number,
  cy: number,
  r: number,
});

type Alt1 = { type: 1; a: string };
type Alt2 = { type: 2; b: number };

const alt1: Decoder<Alt1> = object({ type: constant(1), a: string });
const alt2: Decoder<Alt2> = object({ type: constant(2), b: number });

describe('taggedUnion', () => {
  const decoder = taggedUnion('type', { rectangle, circle });

  test('allows conditional decoding', () => {
    const r = { type: 'rectangle', x: 3, y: 5, width: 80, height: 100 };
    expect(decoder.verify(r)).toEqual(r);

    const c = { type: 'circle', cx: 3, cy: 5, r: 7 };
    expect(decoder.verify(c)).toEqual(c);
  });

  test('invalid', () => {
    expect(() => decoder.verify('foo')).toThrow('Must be an object');
    expect(() => decoder.verify({})).toThrow('Missing key: "type"');
    expect(() => decoder.verify({ type: 'blah' })).toThrow(
      /Must be one of.*rectangle.*circle/,
    );
    expect(() => decoder.verify({ type: 'rectangle', x: 1 })).toThrow(
      /Missing keys: "y", "width", "height"/,
    );
  });
});

describe('taggedUnion with numeric keys', () => {
  const decoder = taggedUnion('type', { [1]: alt1, '2': alt2 });
  //                                    ^^^        ^^^
  //                                    Support both of these syntaxes

  test('allows conditional decoding', () => {
    const a = { type: 1, a: 'hi' };
    expect(decoder.verify(a)).toEqual(a);

    const b = { type: 2, b: 42 };
    expect(decoder.verify(b)).toEqual(b);
  });

  test('invalid', () => {
    expect(() => decoder.verify('foo')).toThrow('Must be an object');
    expect(() => decoder.verify({})).toThrow('Missing key: "type"');
    expect(() => decoder.verify({ type: 'blah' })).toThrow(/Must be one of.*1.*2/);
    expect(() => decoder.verify({ type: 1, x: 1 })).toThrow(/Missing key: "a"/);
    expect(() => decoder.verify({ type: 2, x: 1 })).toThrow(/Missing key: "b"/);
  });
});

describe('select', () => {
  const v1Decoder = object({ title: string });
  const v2Decoder = object({ version: constant(2), title: string, text: string });
  const v3Decoder = object({ version: constant(3), text: string });

  const decoder = select(
    object({ version: optional(oneOf([2, 3])) }),

    (obj) =>
      obj.version === undefined ? v1Decoder : obj.version === 2 ? v2Decoder : v3Decoder,
  );

  test('allows conditional decoding', () => {
    const valid_inputs = [
      { title: 'yo' },
      { version: 2, title: 'yo', text: 'hi' },
      { version: 3, text: 'hi' },
    ];
    for (const input of valid_inputs) {
      expect(decoder.verify(input)).toEqual(input);
    }
  });

  test('invalid', () => {
    expect(() => decoder.verify('foo')).toThrow('Must be an object');
    expect(() => decoder.verify({ ver: 1 })).toThrow('Missing key: "title"');
    expect(() => decoder.verify({ version: 7 })).toThrow('Must be one of 2, 3');
    expect(() => decoder.verify({ version: 'hi' })).toThrow('Must be one of 2, 3');
    expect(() => decoder.verify({ version: 2 })).toThrow('Missing keys: "title", "text"');
    expect(() => decoder.verify({ version: 3 })).toThrow('Missing key: "text"');
    expect(() => decoder.verify({ version: -7 })).toThrow('Must be one of 2, 3');
  });
});
