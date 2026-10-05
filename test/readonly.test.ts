import { describe, expect, test } from 'vitest';

import type { Decoder } from '~';
import {
  always,
  anyNumber,
  anything,
  array,
  bigint,
  boolean,
  constant,
  date,
  decimal,
  either,
  email,
  endsWith,
  enum_,
  exact,
  fail,
  flexDate,
  hexadecimal,
  httpsUrl,
  identifier,
  instanceOf,
  integer,
  isoDate,
  isoDateString,
  ksuid,
  nanoid,
  natural,
  never,
  nonEmptyArray,
  nonEmptyString,
  nonNegativeNumber,
  null_,
  nullable,
  nullish,
  number,
  numeric,
  object,
  oneOf,
  optional,
  poja,
  pojo,
  positiveInteger,
  positiveNumber,
  record,
  regex,
  sized,
  startsWith,
  string,
  taggedUnion,
  trimmed,
  truthy,
  tuple,
  undefined_,
  unknown,
  url,
  urlString,
  uuid,
  uuidv1,
  uuidv4,
} from '~';

enum Color {
  Red = 'red',
  Blue = 'blue',
}

describe('atomics', () => {
  test.each([
    ['string', string],
    ['string({ max })', string({ max: 5 })],
    ['boolean', boolean],
    ['anyNumber', anyNumber],
    ['number', number],
    ['number({ min })', number({ min: 0 })],
    ['integer', integer],
    ['natural', natural],
    ['nonNegativeNumber', nonNegativeNumber],
    ['positiveInteger', positiveInteger],
    ['positiveNumber', positiveNumber],
    ['bigint', bigint],
    ['unknown', unknown],
    ['anything', anything],
    ['pojo', pojo],
    ['poja', poja],
    ['date', date],
    ['instanceOf', instanceOf(Error)],
    ['constant', constant('x')],
    ['null_', null_],
    ['undefined_', undefined_],
    ['oneOf', oneOf(['a', 'b'])],
    ['enum_', enum_(Color)],
    ['never', never('Nope')],
    ['fail', fail('Nope')],
    ['regex', regex(/^a/)],
    ['startsWith', startsWith('a')],
    ['endsWith', endsWith('a')],
    ['nonEmptyString', nonEmptyString],
    ['identifier', identifier],
    ['decimal', decimal],
    ['hexadecimal', hexadecimal],
    ['hexadecimal({ size })', hexadecimal({ size: 4 })],
    ['email', email],
    ['urlString', urlString],
    ['uuid', uuid],
    ['uuidv1', uuidv1],
    ['uuidv4', uuidv4],
    ['nanoid()', nanoid()],
    ['ksuid()', ksuid()],
    ['ksuid({ prefix })', ksuid({ prefix: 'msg_' })],
    ['isoDateString', isoDateString],
    ['sized(string)', sized(string, { max: 3 })],
  ] satisfies [string, Decoder<unknown>][])('%s is readonly', (_, decoder) => {
    expect(decoder.isReadonly).toBe(true);
  });

  test.each([
    ['always', always(42)],
    ['truthy', truthy],
    ['numeric', numeric],
    ['trimmed', trimmed],
    ['isoDate', isoDate],
    ['flexDate', flexDate],
    ['url', url],
    ['httpsUrl', httpsUrl],
  ] satisfies [string, Decoder<unknown>][])('%s is not readonly', (_, decoder) => {
    expect(decoder.isReadonly).toBe(false);
  });

  test('hand back the input itself', () => {
    const obj = { a: 1 };
    const arr = [1, 2];
    const d = new Date();
    expect(pojo.verify(obj)).toBe(obj);
    expect(poja.verify(arr)).toBe(arr);
    expect(unknown.verify(obj)).toBe(obj);
    expect(date.verify(d)).toBe(d);
    expect(instanceOf(Date).verify(d)).toBe(d);
  });
});

describe('either', () => {
  test('readonly iff every branch is', () => {
    expect(either(string, number).isReadonly).toBe(true);
    expect(either(string, numeric).isReadonly).toBe(false);
  });

  test('hands back the input itself', () => {
    const obj = { a: 1 };
    expect(either(string, pojo).verify(obj)).toBe(obj);
  });
});

describe('optional, nullable, nullish', () => {
  test.each([
    ['optional', optional(pojo)],
    ['nullable', nullable(pojo)],
    ['nullish', nullish(pojo)],
  ] satisfies [string, Decoder<unknown>][])('%s(d) inherits from d', (_, decoder) => {
    expect(decoder.isReadonly).toBe(true);
    const obj = { a: 1 };
    expect(decoder.verify(obj)).toBe(obj);
  });

  test.each([
    ['optional', optional(numeric)],
    ['nullable', nullable(numeric)],
    ['nullish', nullish(numeric)],
    ['optional with default', optional(pojo, {})],
    ['nullable with default', nullable(pojo, {})],
    ['nullish with default', nullish(pojo, {})],
  ] satisfies [string, Decoder<unknown>][])('%s is not readonly', (_, decoder) => {
    expect(decoder.isReadonly).toBe(false);
  });
});

describe('taggedUnion', () => {
  const a = exact({ type: constant('a'), x: string });
  const b = exact({ type: constant('b'), y: number });

  test('readonly iff every branch is', () => {
    expect(taggedUnion('type', { a: pojo, b: pojo }).isReadonly).toBe(true);
    expect(taggedUnion('type', { a: pojo, b: object({}) }).isReadonly).toBe(false);
    expect(taggedUnion('type', { a, b }).isReadonly).toBe(a.isReadonly && b.isReadonly);
  });

  test('hands back the input itself', () => {
    const input = { type: 'a', x: 'hi' };
    expect(taggedUnion('type', { a: pojo, b: pojo }).verify(input)).toBe(input);
  });
});

describe('array, nonEmptyArray, tuple', () => {
  test.each([
    ['array', array(pojo), [{ a: 1 }, { b: 2 }]],
    ['array with options', array(pojo, { max: 3 }), [{ a: 1 }]],
    ['nonEmptyArray', nonEmptyArray(pojo), [{ a: 1 }]],
    ['tuple', tuple(pojo, string), [{ a: 1 }, 'x']],
    ['nested', array(array(string)), [['a'], ['b', 'c']]],
  ] satisfies [string, Decoder<unknown>, unknown][])(
    '%s of readonly items hands back the input itself',
    (_, decoder, input) => {
      expect(decoder.isReadonly).toBe(true);
      expect(decoder.verify(input)).toBe(input);
    },
  );

  test.each([
    ['array', array(numeric), ['1']],
    ['nonEmptyArray', nonEmptyArray(numeric), ['1']],
    ['tuple', tuple(string, numeric), ['x', '1']],
  ] satisfies [string, Decoder<unknown>, unknown][])(
    '%s of non-readonly items copies',
    (_, decoder, input) => {
      expect(decoder.isReadonly).toBe(false);
      expect(decoder.verify(input)).not.toBe(input);
    },
  );

  test('readonly arrays still reject bad items', () => {
    expect(() => array(string).verify(['a', 1])).toThrow('Must be string (at index 1)');
    expect(() => tuple(string, string).verify(['a', 1])).toThrow('Must be string');
  });
});

describe('record', () => {
  test.each([
    ['record(v)', record(pojo), { a: { x: 1 } }],
    ['record(v, options)', record(string, { max: 2 }), { a: 'x' }],
    ['record(k, v)', record(regex(/^[a-z]+$/), string), { a: 'x' }],
  ] satisfies [string, Decoder<unknown>, unknown][])(
    '%s of readonly decoders hands back the input itself',
    (_, decoder, input) => {
      expect(decoder.isReadonly).toBe(true);
      expect(decoder.verify(input)).toBe(input);
    },
  );

  test.each([
    ['record(v)', record(numeric), { a: '1' }],
    ['record(k, v)', record(trimmed, string), { a: 'x' }],
  ] satisfies [string, Decoder<unknown>, unknown][])(
    '%s with a non-readonly decoder copies',
    (_, decoder, input) => {
      expect(decoder.isReadonly).toBe(false);
      expect(decoder.verify(input)).not.toBe(input);
    },
  );

  test('readonly records still reject bad values and unsafe keys', () => {
    expect(() => record(string).verify({ a: 1 })).toThrow('Must be string');
    expect(() => record(string).verify(JSON.parse('{"__proto__": "x"}'))).toThrow(
      'Unsafe key',
    );
  });
});
