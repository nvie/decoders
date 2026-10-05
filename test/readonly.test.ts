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
  email,
  endsWith,
  enum_,
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
  number,
  numeric,
  oneOf,
  poja,
  pojo,
  positiveInteger,
  positiveNumber,
  regex,
  sized,
  startsWith,
  string,
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
