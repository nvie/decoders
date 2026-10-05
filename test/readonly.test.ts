import { describe, expect, test } from 'vitest';

import type { Decoder } from '~';
import {
  always,
  anyNumber,
  anything,
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
  nanoid,
  natural,
  never,
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
  regex,
  sized,
  startsWith,
  string,
  taggedUnion,
  trimmed,
  truthy,
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
