import { describe, expect, test } from 'vitest';

import { formatInline, number, object, optional, positiveInteger, string } from '~';

describe('error messages (simple optional strings)', () => {
  const decoder = object({ name: optional(string) });

  test('valid', () => {
    expect(decoder.verify({})).toEqual({});
    expect(decoder.verify({ name: 'hi' })).toEqual({ name: 'hi' });
  });

  test('invalid', () => {
    expect(() => decoder.verify({ name: null })).toThrow(`
{
  "name": null,
          ^^^^
          Either:
          - Must be undefined
          - Must be string
}`);
  });
});

describe('error messages (optional objects)', () => {
  const decoder = object({
    person: optional(object({ name: string, age: positiveInteger })),
  });

  test('valid', () => {
    expect(decoder.verify({})).toEqual({});
    expect(decoder.verify({ person: { name: 'Alice', age: 29 } })).toEqual({
      person: {
        name: 'Alice',
        age: 29,
      },
    });
  });

  test('invalid', () => {
    const ann = decoder.decode({ person: { name: 'Alice', age: 'thirty' } }).error!;
    expect(formatInline(ann)).toMatchSnapshot();
  });
});
