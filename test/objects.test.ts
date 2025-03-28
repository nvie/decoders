import { describe, expect, test } from 'vitest';

import { hardcoded, optional, unknown } from '~/basics';
import { boolean } from '~/booleans';
import { mapping, record } from '~/collections';
import { number } from '~/numbers';
import { exact, inexact, object, pojo } from '~/objects';
import { decimal, numeric, regex, string } from '~/strings';

describe('objects', () => {
  test('decodes objects and fields', () => {
    const decoder = object({
      id: number,
      name: string,
    });

    expect(decoder.verify({ id: 1, name: 'test' })).toEqual({
      id: 1,
      name: 'test',
    });

    // Unexpected extra keys are just ignored
    expect(decoder.verify({ id: 1, name: 'test', extra: 'abundance' })).toEqual({
      id: 1,
      name: 'test',
    });
  });

  test('empty objects', () => {
    const decoder = object({});
    expect(decoder.verify({ id: 1, name: 'test' })).toEqual({});
    expect(decoder.verify({})).toEqual({});
  });

  test('decodes objects and fields (ignore unknown fields)', () => {
    // Unexpected extra keys are ignored
    const decoder = object({
      id: number,
      name: string,
      extra: optional(string),
    });

    expect(decoder.verify({ id: 1, name: 'test' })).toEqual({
      id: 1,
      name: 'test',
    });
    expect(decoder.verify({ id: 1, name: 'test', extra: 'foo' })).toEqual({
      id: 1,
      name: 'test',
      extra: 'foo',
    });
  });

  test('objects with optional fields will be implicit-undefined', () => {
    const defaults = {
      extra: 'default',
    };

    const decoder = object({
      id: number,
      name: string,
      extra: optional(string),
    });

    expect({
      ...defaults,
      ...decoder.verify({ id: 1, name: 'test' }),
    }).toEqual({
      id: 1,
      name: 'test',
      extra: 'default',
    });
  });

  test('reports all errors at once', () => {
    const decoder = object({
      id: number,
      name: string,
      extra: optional(string),
    });

    // All good (no missing/decoding errors)
    expect(() => decoder.verify({ id: 1, name: 'valid' })).not.toThrow('Must be string');
    expect(() => decoder.verify({ id: 1, name: 'valid' })).not.toThrow('Missing key');
    expect(() => decoder.verify({ id: 1, name: 'valid', extra: undefined })).not.toThrow(
      'Must be string',
    );
    expect(() => decoder.verify({ id: 1, name: 'valid', extra: undefined })).not.toThrow(
      'Missing key',
    );

    // Test missing key errors
    expect(() => decoder.verify({ name: 'valid' })).toThrow("Missing key: 'id'");
    expect(() => decoder.verify({ name: 'valid' })).not.toThrow('Must be string');
    expect(() => decoder.verify({ name: 'valid', extra: undefined })).toThrow(
      "Missing key: 'id'",
    );
    expect(() => decoder.verify({ name: 'valid', extra: undefined })).not.toThrow(
      'Must be string',
    );
    expect(() => decoder.verify({ extra: 'valid' })).toThrow(
      "Missing keys: 'id', 'name'",
    );
    expect(() => decoder.verify({ extra: 'valid' })).not.toThrow('Must be string');
    expect(() => decoder.verify({ name: undefined, extra: 'valid' })).toThrow(
      "Missing keys: 'id', 'name'",
    );
    expect(() => decoder.verify({ name: undefined, extra: 'valid' })).not.toThrow(
      'Must be string',
    );

    // Now test that both errors are part of the same error!
    expect(() => decoder.verify({ name: 42 })).toThrow('Must be string');
    expect(() => decoder.verify({ name: 42 })).toThrow("Missing key: 'id'");

    // Both of these messages are part of the same error!
    expect(() => decoder.verify({ extra: 42 })).toThrow('Must be string');

    // More than one error
    expect(() => decoder.verify({ name: 42, id: 'hi' })).toThrow();
  });

  test('errors on non-objects', () => {
    const decoder = object({ id: string });

    expect(decoder.decode('foo').ok).toBe(false);
    expect(decoder.decode(3.14).ok).toBe(false);
    expect(decoder.decode([]).ok).toBe(false);
    expect(decoder.decode(undefined).ok).toBe(false);
    expect(decoder.decode(NaN).ok).toBe(false);
    expect(decoder.decode({ foo: [1, 2, 3] }).ok).toBe(false); // Missing key "id"
    expect(decoder.decode({ id: 3 }).ok).toBe(false); // Invalid field value for "id"
  });

  test('readonliness', () => {
    const decoder = object({ id: string });

    // object() decoder is never read-only, as extra fields will be discarded
    expect(decoder.isReadonly).toBe(false);
  });
});

describe('exact objects', () => {
  test('decodes objects and fields', () => {
    const decoder = exact({ id: number, name: string });
    expect(decoder.verify({ id: 1, name: 'test' })).toEqual({
      id: 1,
      name: 'test',
    });
  });

  test('fails on superfluous keys', () => {
    const decoder = exact({ id: number, name: string });
    expect(() =>
      decoder.verify({
        id: 1,
        name: 'test',
        superfluous: 'abundance',
        more: 'yo',
      }),
    ).toThrow("Unexpected extra keys: 'superfluous', 'more'");
  });

  test('retains extra hardcoded fields', () => {
    const decoder = exact({
      id: number,
      name: string,
      extra: hardcoded('extra'),
    });
    expect(decoder.verify({ id: 1, name: 'test' })).toEqual({
      id: 1,
      name: 'test',
      extra: 'extra',
    });
    expect(decoder.verify({ id: 1, name: 'test', extra: 42 })).toEqual({
      id: 1,
      name: 'test',
      extra: 'extra',
    });
    expect(() =>
      decoder.verify({ id: 1, name: 'test', superfluous: 'abundance' }),
    ).toThrow("Unexpected extra keys: 'superfluous'");
    expect(() =>
      decoder.verify({ id: 1, name: 'test', extra: 42, superfluous: 'abundance' }),
    ).toThrow("Unexpected extra keys: 'superfluous'");
  });

  test('empty objects', () => {
    const decoder = exact({});
    expect(() => decoder.verify({ id: 1, name: 'test' })).toThrow();
    expect(decoder.verify({})).toEqual({});
  });

  test('errors on non-objects', () => {
    const decoder = exact({ id: string });

    expect(decoder.decode('foo').ok).toBe(false);
    expect(decoder.decode(3.14).ok).toBe(false);
    expect(decoder.decode([]).ok).toBe(false);
    expect(decoder.decode(undefined).ok).toBe(false);
    expect(decoder.decode(NaN).ok).toBe(false);
    expect(decoder.decode({ foo: [1, 2, 3] }).ok).toBe(false); // Missing key "id"
    expect(decoder.decode({ id: 3 }).ok).toBe(false); // Invalid field value for "id"
  });

  test('exact objects with optional fields will be implicit-undefined', () => {
    const defaults = {
      extra: 'default',
    };

    const decoder = exact({
      id: number,
      name: string,
      extra: optional(string),
    });

    expect({
      ...defaults,
      ...decoder.verify({ id: 1, name: 'test' }),
    }).toEqual({
      id: 1,
      name: 'test',
      extra: 'default',
    });
  });

  describe('readonliness', () => {
    test('inherits readonliness when possible', () => {
      const decoder = exact({
        id: number,
        name: string,
        extra: optional(string),
      });

      expect(decoder.isReadonly).toBe(true);
    });

    test('does not inherit readonliness when not possible', () => {
      const decoder = exact({
        id: numeric,
        //  ^^^^^^^ not readonly
      });

      expect(decoder.isReadonly).toBe(false);
    });
  });
});

describe('inexact objects', () => {
  test('decodes objects and fields', () => {
    const decoder = inexact({ id: number, name: string });
    expect(decoder.verify({ id: 1, name: 'test' })).toEqual({
      id: 1,
      name: 'test',
    });

    // Extra properties will be retained, but "unknown"
    expect(decoder.verify({ id: 1, name: 'test', extra1: 123, extra2: 'hey' })).toEqual({
      id: 1,
      name: 'test',
      extra1: 123,
      extra2: 'hey',
    });
  });

  test('retains extra hardcoded fields', () => {
    const decoder = inexact({ id: number, name: string, extra: hardcoded('extra') });
    expect(decoder.verify({ id: 1, name: 'test', extra: 42 })).toEqual({
      id: 1,
      name: 'test',
      extra: 'extra',
    });
    expect(decoder.verify({ id: 1, name: 'test' })).toEqual({
      id: 1,
      name: 'test',
      extra: 'extra',
    });

    // Extra properties will be retained, but "unknown"
    expect(decoder.verify({ id: 1, name: 'test', extra1: 123, extra2: 'hey' })).toEqual({
      id: 1,
      name: 'test',
      extra: 'extra',
      extra1: 123,
      extra2: 'hey',
    });
  });

  test('empty objects', () => {
    const decoder = inexact({});
    expect(decoder.verify({ id: 1, name: 'test' })).toEqual({ id: 1, name: 'test' });
    expect(decoder.verify({})).toEqual({});
  });

  test('errors on non-objects', () => {
    const decoder = inexact({ id: string });

    expect(decoder.decode('foo').ok).toBe(false);
    expect(decoder.decode(3.14).ok).toBe(false);
    expect(decoder.decode([]).ok).toBe(false);
    expect(decoder.decode(undefined).ok).toBe(false);
    expect(decoder.decode(NaN).ok).toBe(false);
    expect(decoder.decode({ foo: [1, 2, 3] }).ok).toBe(false); // Missing key "id"
    expect(decoder.decode({ id: 3 }).ok).toBe(false); // Invalid field value for "id"
  });

  test('inexact objects with optional fields will be implicit-undefined', () => {
    const defaults = {
      foo: 'default',
      bar: 'default',
    };

    const decoder = inexact({
      foo: optional(string),
    });

    expect({
      ...defaults,
      ...decoder.verify({ foo: undefined, bar: undefined }),
    }).toEqual({
      foo: 'default', // 'foo' is known and allowed-optional, so this will be implicit-undefined
      bar: undefined, // 'bar' is ignored so the explicit-undefined will override here
    });
  });

  // XXX Implement
  test('readonliness', () => {
    // expect(decoder.isReadonly).toBe(true);
  });
});

describe('pojo', () => {
  const decoder = pojo;

  test('decodes objects and fields', () => {
    expect(decoder.verify({})).toEqual({});
    expect(decoder.verify({ a: 1 })).toEqual({ a: 1 });

    // Not
    expect(() => decoder.verify(null)).toThrow();
    expect(() => decoder.verify(42)).toThrow();
  });

  test('readonliness', () => {
    expect(decoder.isReadonly).toBe(true);
  });
});

describe('objects w/ circular refs', () => {
  // Take any decoder and pass in some self-referential object
  const value = { foo: 42 };
  const self = value;
  (value as any).self = self;

  test('valid', () => {
    expect(object({ foo: number }).verify(value)).toEqual({ foo: 42 });
    expect(object({ foo: number, self: unknown }).verify(value)).toEqual({
      foo: 42,
      self,
    });
    expect(object({ foo: number, self: pojo }).verify(value)).toEqual({
      foo: 42,
      self,
    });
    expect(object({ foo: number, self: object({ foo: number }) }).verify(value)).toEqual({
      foo: 42,
      self: { foo: 42 },
    });
    expect(
      object({
        foo: number,
        self: object({
          foo: number,
          self: object({ self: object({ foo: number }) }),
        }),
      }).verify(value),
    ).toEqual({
      foo: 42,
      self: {
        foo: 42,
        self: {
          self: {
            foo: 42,
          },
        },
      },
    });
  });

  test('invalid', () => {
    expect(object({ foo: string }).decode(value).ok).toBe(false);
    expect(object({ foo: string, self: unknown }).decode(value).ok).toBe(false);
    expect(object({ foo: string, self: pojo }).decode(value).ok).toBe(false);
    expect(object({ foo: number, self: object({ foo: string }) }).decode(value).ok).toBe(
      false,
    );
    expect(
      object({
        foo: number,
        self: object({
          foo: number,
          self: object({ self: object({ foo: string }) }),
        }),
      }).decode(value).ok,
    ).toBe(false);
  });

  // XXX Implement
  test('readonliness', () => {
    // expect(decoder.isReadonly).toBe(true);
  });
});

describe('arrays are not objects', () => {
  const decoder1 = object({});
  const decoder2 = object({
    opt: optional(string),
  });

  test('valid', () => {
    expect(decoder1.verify({ what: 'ever' })).toEqual({});
    expect(decoder2.verify({ what: 'ever' })).toEqual({});
  });

  test('invalid (basic types)', () => {
    expect(() => decoder1.verify([])).toThrow('Must be an object');
    expect(() => decoder2.verify([])).toThrow('Must be an object');
    expect(() => decoder1.verify('an string')).toThrow('Must be an object');
    expect(() => decoder2.verify('an string')).toThrow('Must be an object');
  });

  test('invalid (custom classes)', () => {
    expect(() => decoder1.verify(new String())).toThrow('Must be an object');
    expect(() => decoder2.verify(new String())).toThrow('Must be an object');
    expect(() => decoder1.verify(new Error('foo'))).toThrow('Must be an object');
    expect(() => decoder2.verify(new Error('foo'))).toThrow('Must be an object');
    expect(() => decoder1.verify(new Date())).toThrow('Must be an object');
    expect(() => decoder2.verify(new Date())).toThrow('Must be an object');
  });

  // XXX Should inherit
  test.fails('readonliness', () => {
    expect(decoder1.isReadonly).toBe(true);
    expect(decoder2.isReadonly).toBe(true);
  });
});

describe('mapping', () => {
  const decoder = mapping(object({ name: string }));

  test('valid', () => {
    const input = {
      '18': { name: 'foo' },
      '23': { name: 'bar' },
      key: { name: 'value' },
    };
    const output = new Map([
      ['18', { name: 'foo' }],
      ['23', { name: 'bar' }],
      ['key', { name: 'value' }],
    ]);
    expect(decoder.verify(input)).toEqual(output);
  });

  test('invalid', () => {
    expect(() => decoder.verify('foo')).toThrow('Must be an object');
    expect(() => decoder.verify({ foo: 1 })).toThrow('Must be an object');
    expect(() => decoder.verify({ foo: {} })).toThrow("Missing key: 'name'");
    expect(() =>
      decoder.verify({
        '124': { invalid: true },
        '125': { name: 'bar' },
      }),
    ).toThrow("Missing key: 'name'");

    // More than one error
    expect(() => decoder.verify({ foo: 42, bar: 42 })).toThrow();
  });

  // XXX Implement
  test.fails('readonliness', () => {
    expect(decoder.isReadonly).toBe(true);
  });
});

// Single-argument form of record() only specifies value type
describe('record', () => {
  const decoder = record(object({ name: string }));

  test('valid', () => {
    const input = {
      '18': { name: 'foo' },
      '23': { name: 'bar' },
      key: { name: 'value' },
    };
    expect(decoder.verify(input)).toEqual(input);
  });

  test('invalid', () => {
    expect(() => decoder.verify('foo')).toThrow('Must be an object');
    expect(() => decoder.verify({ foo: 1 })).toThrow('Must be an object');
    expect(() => decoder.verify({ foo: {} })).toThrow("Missing key: 'name'");
    expect(() =>
      decoder.verify({
        '124': { invalid: true },
        '125': { name: 'bar' },
      }),
    ).toThrow("Missing key: 'name'");
  });

  // XXX Implement
  test.fails('readonliness', () => {
    expect(decoder.isReadonly).toBe(true);
  });
});

// Two-argument form of record() specifies keys and value types
describe('record with key validation', () => {
  const decoder = record(decimal, boolean);

  test('valid', () => {
    const input = { '1': false, '2': true };
    expect(decoder.verify(input)).toEqual(input);
  });

  test('valid (another example)', () => {
    const key = regex(/^a+$/, "Must be all a's");
    const decoder = record(key, boolean);
    expect(decoder.verify({ a: true })).toEqual({ a: true });
    expect(decoder.verify({ aa: true })).toEqual({ aa: true });
    expect(decoder.verify({ aaaaa: true })).toEqual({ aaaaa: true });
    expect(() => decoder.verify({ abc: true })).toThrow(
      "Invalid key 'abc': Must be all a's",
    );
  });

  test('valid (another example with key transformations)', () => {
    const key = regex(/^a+$/, "Must be all a's");
    const decoder = record(
      key.transform(() => 'a'),
      boolean,
    );
    expect(decoder.verify({ a: true })).toEqual({ a: true });
    expect(decoder.verify({ a: true, aa: false })).toEqual({ a: false });
    expect(() => decoder.verify({ a: true, 1: false })).toThrow(
      "Invalid key '1': Must be all a's",
    );
  });

  test('invalid', () => {
    expect(() => decoder.verify('foo')).toThrow('Must be an object');
    expect(() => decoder.verify({ 13: 1 })).toThrow('Must be boolean');
    expect(() => decoder.verify({ 42: {} })).toThrow('Must be boolean');
    expect(() => decoder.verify({ x: true })).toThrow(
      "Invalid key 'x': Must only contain digits",
    );
    expect(() => decoder.verify({ '': true })).toThrow(
      "Invalid key '': Must only contain digits",
    );
  });

  describe('readonliness', () => {
    test('inherits readonliness when possible', () => {
      // value decoders is readonly
      const decoder1 = record(number);
      expect(decoder1.isReadonly).toBe(true);

      // key and value decoders are readonly
      const decoder2 = record(string, number);
      expect(decoder2.isReadonly).toBe(true);

      // key and value decoders are readonly
      const decoder3 = record(decimal, number);
      expect(decoder3.isReadonly).toBe(true);
    });

    test('does not inherit readonliness when not possible', () => {
      const decoder1 = record(
        // value decoder not readonly
        string.transform((s) => s.toUpperCase()),
      );
      expect(decoder1.isReadonly).toBe(false);

      const decoder2 = record(
        string.transform((s) => s.toUpperCase()), // key decoder not readonly
        number,
      );
      expect(decoder2.isReadonly).toBe(false);

      const decoder3 = record(
        decimal,
        string.transform((s) => s.toUpperCase()), // value decoder not readonly
      );
      expect(decoder3.isReadonly).toBe(false);
    });
  });
});
