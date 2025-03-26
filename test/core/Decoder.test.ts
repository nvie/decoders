import { describe, expect, test } from 'vitest';

import { always, optional } from '~/basics';
import { annotate, define, formatInline, formatShort, readonly } from '~/core';
import { number, positiveInteger } from '~/numbers';
import { pojo } from '~/objects';
import { numeric, string } from '~/strings';

test('.decode', () => {
  // .decode() is tested implicitly because it's used _everywhere_
});

describe('define()', () => {
  const decoder = define(
    (blob, ok, err) =>
      blob === 123
        ? ok(123) // Either a decode result...
        : blob === 'now'
          ? ok(new Date()) // ...or another...
          : err('fail!'), // ...or a failure...
  );

  test('accepts', () => {
    expect(decoder.verify(123)).toEqual(123);
    expect(decoder.verify('now')).toEqual(expect.any(Date));
  });

  test('rejects', () => {
    expect(() => decoder.verify(0)).toThrow();
    expect(() => decoder.verify(new Date())).toThrow();
    expect(() => decoder.verify([])).toThrow();
    expect(() => decoder.verify('hey')).toThrow(/fail!/);
  });
});

describe('.verify()', () => {
  test('valid', () => {
    const decoder = number;
    expect(decoder.verify(0)).toBe(0);
    expect(decoder.verify(1)).toBe(1);
    expect(decoder.verify(4)).toBe(4);
    expect(decoder.verify(-3)).toBe(-3);
    expect(decoder.verify(-3.14)).toBe(-3.14);
  });

  test('invalid', () => {
    const decoder = number;
    expect(() => decoder.verify('foo')).toThrow('Must be number');
  });

  test('different erroring styles', () => {
    const decoder = number;

    // Default
    expect(() => decoder.verify('xyz')).toThrow('xyz');
    expect(() => decoder.verify('xyz')).toThrow('Must be number');

    // Same as default
    expect(() => decoder.verify('xyz', formatInline)).toThrow('xyz');
    expect(() => decoder.verify('xyz', formatInline)).toThrow('Must be number');

    // Without echoing back the inputs
    expect(() => decoder.verify('xyz', formatShort)).not.toThrow('xyz');
    //                                               ^^^ Make sure the input is _NOT_ echoed back
    expect(() => decoder.verify('xyz', formatShort)).toThrow(/Must be number/);

    // Throwing a custom error
    expect(() => decoder.verify('xyz', () => new Error('Computer says no'))).toThrow(
      /Computer says no/,
    );
  });
});

describe('.value()', () => {
  test('valid', () => {
    const decoder = number;
    expect(decoder.value(0)).toBe(0);
    expect(decoder.value(1)).toBe(1);
    expect(decoder.value(4)).toBe(4);
    expect(decoder.value(-3)).toBe(-3);
    expect(decoder.value(-3.14)).toBe(-3.14);
  });

  test('invalid', () => {
    const decoder = number;
    expect(decoder.value('foo')).toBeUndefined();
  });
});

describe('.then() with acceptance function', () => {
  const hex =
    // We already know how to decode strings...
    string.then(
      // We'll try to parse it as an hex int, but if it fails, we'll
      // return Err, otherwise Ok
      (s, ok, err) => {
        const n = parseInt(s, 16);
        return !Number.isNaN(n) ? ok(n) : err('Nope');
      },
    );

  test('valid type of decode result', () => {
    expect(hex.verify('100')).toEqual(256);
    expect(hex.verify('DEADC0DE')).toEqual(0xdeadc0de);
  });

  test('invalid', () => {
    expect(() => hex.verify('no good hex value')).toThrow('Nope');
  });
});

describe('.then() with acceptance function returning a decoder', () => {
  const decoder = string.transform(Number).then(() => positiveInteger);

  test('valid type of decode result', () => {
    expect(decoder.verify('100')).toEqual(100);
    expect(decoder.verify(' 123  ')).toEqual(123);
    expect(decoder.verify('2387213979')).toEqual(2387213979);
  });

  test('invalid', () => {
    expect(() => decoder.verify('not a numeric string')).toThrow('Number must be finite');
    expect(() => decoder.verify(42)).toThrow('Must be string');
    expect(() => decoder.verify('-123')).toThrow('Number must be positive');
    expect(() => decoder.verify('3.14')).toThrow('Number must be an integer');
  });
});

describe('.then() directly taking a decoder', () => {
  const decoder = string.transform(Number).then(positiveInteger);

  test('valid type of decode result', () => {
    expect(decoder.verify('100')).toEqual(100);
    expect(decoder.verify(' 123  ')).toEqual(123);
    expect(decoder.verify('2387213979')).toEqual(2387213979);
  });

  test('invalid', () => {
    expect(() => decoder.verify('not a numeric string')).toThrow('Number must be finite');
    expect(() => decoder.verify(42)).toThrow('Must be string');
    expect(() => decoder.verify('-123')).toThrow('Number must be positive');
    expect(() => decoder.verify('3.14')).toThrow('Number must be an integer');
  });
});

describe('.pipe() with single decoder arg', () => {
  const decoder = string.transform(Number).pipe(positiveInteger);

  test('valid type of decode result', () => {
    expect(decoder.verify('100')).toEqual(100);
    expect(decoder.verify(' 123  ')).toEqual(123);
    expect(decoder.verify('2387213979')).toEqual(2387213979);
  });

  test('invalid', () => {
    expect(() => decoder.verify('not a numeric string')).toThrow('Number must be finite');
    expect(() => decoder.verify(42)).toThrow('Must be string');
    expect(() => decoder.verify('-123')).toThrow('Number must be positive');
    expect(() => decoder.verify('3.14')).toThrow('Number must be an integer');
  });
});

describe('.pipe() with decoder function arg', () => {
  const decoder = string
    .transform(Number)
    .pipe((x) => (isNaN(x) || x <= 999 ? positiveInteger : always('A big number!')));

  test('valid type of decode result', () => {
    expect(decoder.verify('0')).toEqual(0);
    expect(decoder.verify('100')).toEqual(100);
    expect(decoder.verify(' 123  ')).toEqual(123);
    expect(decoder.verify('999')).toEqual(999);
    expect(decoder.verify(' 1000 ')).toEqual('A big number!');
    expect(decoder.verify('2387213979')).toEqual('A big number!');
  });

  test('invalid', () => {
    expect(() => decoder.verify('not a numeric string')).toThrow('Number must be finite');
    expect(() => decoder.verify(42)).toThrow('Must be string');
    expect(() => decoder.verify('-123')).toThrow('Number must be positive');
    expect(() => decoder.verify('3.14')).toThrow('Number must be an integer');
  });
});

describe('.transform()', () => {
  test('change type of decode result', () => {
    const len = string.transform((s) => s.length);
    expect(len.verify('foo')).toEqual(3);
    expect(len.verify('Lorem ipsum dolor sit amet.')).toEqual(27);
  });

  test('change value, not type, of decoded results', () => {
    const upcase = string.transform((s) => s.toUpperCase());
    expect(upcase.verify('123')).toEqual('123');
    expect(upcase.verify('I am Hulk')).toEqual('I AM HULK');
  });

  test('a failing transformation function will fail the decoder', () => {
    const odd = number.transform((n) => {
      if (n % 2 !== 0) return n;
      throw new Error('Must be odd');
    });
    expect(odd.verify(13)).toEqual(13);
    expect(() => odd.verify(4)).toThrow('^ Must be odd');
    expect(odd.decode(3).ok).toBe(true);
    expect(odd.decode(4).ok).toBe(false);

    const weirdEven = number.transform((n) => {
      if (n % 2 === 0) return n;
      throw 'Must be even'; // Throwing a string, not an Error is non-conventional, but won't break anything
    });
    expect(weirdEven.decode(3).ok).toBe(false);
    expect(() => weirdEven.verify(3)).toThrow('^ Must be even');
    expect(weirdEven.verify(4)).toEqual(4);
  });
});

describe('.refine()', () => {
  const odd = number.refine((n) => n % 2 !== 0, 'Must be odd');

  test('valid', () => {
    expect(odd.decode(0).ok).toEqual(false);
    expect(odd.decode(1).ok).toEqual(true);
    expect(odd.decode(2).ok).toEqual(false);
    expect(odd.decode(3).ok).toEqual(true);
    expect(odd.decode(4).ok).toEqual(false);
    expect(odd.decode(5).ok).toEqual(true);
    expect(odd.decode(-1).ok).toEqual(true);
    expect(odd.decode(-2).ok).toEqual(false);
    expect(odd.decode(-3).ok).toEqual(true);
    expect(odd.decode(-4).ok).toEqual(false);
    expect(odd.decode(-5).ok).toEqual(true);
  });
});

describe('.reject() (simple)', () => {
  const decoder = pojo.reject((obj) => {
    const badKeys = Object.keys(obj).filter((key) => key.startsWith('_'));
    return badKeys.length > 0 ? `Disallowed keys: ${badKeys.join(', ')}` : null;
  });

  test('valid', () => {
    expect(decoder.decode({ id: 123, name: 'Bob' }).ok).toEqual(true);
    expect(() => decoder.verify({ id: 123, _x: 123, _y: 'Bob' })).toThrow(
      /Disallowed keys: _x, _y/,
    );
  });
});

describe('.reject() (w/ Annotation)', () => {
  const odd = number.reject((n) =>
    n % 2 === 0 ? annotate('***', "Can't show ya, but this must be odd") : null,
  );

  test('valid', () => {
    expect(odd.decode(0).ok).toEqual(false);
    expect(odd.decode(1).ok).toEqual(true);
    expect(odd.decode(2).ok).toEqual(false);
    expect(odd.decode(3).ok).toEqual(true);
    expect(odd.decode(4).ok).toEqual(false);
    expect(odd.decode(5).ok).toEqual(true);
    expect(odd.decode(-1).ok).toEqual(true);
    expect(odd.decode(-2).ok).toEqual(false);
    expect(odd.decode(-3).ok).toEqual(true);
    expect(odd.decode(-4).ok).toEqual(false);
    expect(odd.decode(-5).ok).toEqual(true);
  });
});

describe('.describe()', () => {
  const decoder = string.describe('Must be text');

  test('valid', () => {
    expect(decoder.verify('foo')).toBe('foo');
    expect(decoder.verify('')).toBe('');
  });

  test('invalid', () => {
    expect(() => decoder.verify(0)).toThrow(/Must be text/);
  });
});

describe('readonly() helper', () => {
  test('is a no-op when the given decoder is read-only', () => {
    const decoder = optional(string);
    expect(readonly(decoder)).toBe(decoder);
  });

  test("throws when the given decoder isn't read-only", () => {
    const decoder = optional(numeric);
    expect(() => readonly(decoder)).toThrow(
      'Decoder setup error: this decoder is required to be readonly',
    );
  });
});
