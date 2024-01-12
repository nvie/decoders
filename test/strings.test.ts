import * as fc from 'fast-check';
import { partition } from 'itertools';
import { describe, expect, test } from 'vitest';

import {
  decimal,
  email,
  hexadecimal,
  httpsUrl,
  nanoid,
  nonEmptyString,
  numeric,
  regex,
  string,
  url,
  uuid,
  uuidv1,
  uuidv4,
} from '~/strings';

import { INPUTS } from './_fixtures';

describe('string', () => {
  const decoder = string;
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
      expect(() => decoder.verify(value)).toThrow();
    }
  });
});

describe('regex', () => {
  const decoder = regex(/[0-9]{4}-[0-9]{2}-[0-9]{2}/, 'Must be YYYY-MM-DD');

  test('valid', () => {
    expect(decoder.verify('2017-12-16')).toBe('2017-12-16');
    expect(decoder.verify('1999-99-55')).toBe('1999-99-55'); // Remember, just regexes not valid dates! ;)
    expect(decoder.verify("Party like it's 1999-01-01")).toBe(
      "Party like it's 1999-01-01",
    ); // Remember, regex is unbounded
  });

  test('invalid', () => {
    expect(() => decoder.verify(42)).toThrow('Must be string'); // All regexes must be strings
    expect(() => decoder.verify('11-22-33')).toThrow('Must be YYYY-MM-DD');
    expect(() => decoder.verify('invalid')).toThrow('Must be YYYY-MM-DD');
  });
});

describe('email', () => {
  const decoder = email;

  test('valid', () => {
    const valids = [
      'test@yahoo.com',
      'foo-BAR@gmail.com',
      'no-reply+blah-12345678901234567@mail.foobar.qoz',
      'a@b.co',
    ];
    for (const valid of valids) {
      expect(decoder.verify(valid)).toBe(valid);
    }
  });

  test('invalid', () => {
    const invalids = [
      '',
      'foo',
      'foobar@gmail',
      'me@nvie.com ', // Note the trailing space
    ];
    for (const invalid of invalids) {
      expect(() => decoder.verify(invalid)).toThrow('Must be email');
    }
    expect(() => decoder.verify(123)).toThrow('Must be string');
  });
});

describe('url', () => {
  const decoder = url;

  test('valid', () => {
    expect(decoder.verify(new URL('https://nvie.com/')).toString()).toEqual(
      'https://nvie.com/',
    );
    expect(decoder.verify('https://nvie.com').toString()).toEqual('https://nvie.com/');
    expect(decoder.verify('https://example.com/foo?q=foo/bar').toString()).toBe(
      'https://example.com/foo?q=foo/bar',
    );
    expect(
      decoder.verify('https://user:pass@nvie.com:443/foo?q=bar&b=baz#qux').toString(),
    ).toBe('https://user:pass@nvie.com/foo?q=bar&b=baz#qux');
    expect(decoder.verify('https://res.example.com/a_b,c_1d/foo.svg').toString()).toBe(
      'https://res.example.com/a_b,c_1d/foo.svg',
    );
  });

  test('custom URL schemes', () => {
    const decoder = url.refine(
      (value) => ['http:', 'git+ssh:', 'ftp:'].includes(value.protocol),
      'Must be http, git+ssh, or ftp URL',
    );
    expect(decoder.verify('http://nvie.com').toString()).toBe('http://nvie.com/');
    expect(decoder.verify('ftp://nvie.com:80/').toString()).toBe('ftp://nvie.com:80/');
    expect(decoder.verify('git+ssh://foo@nvie.com/blah.git').toString()).toBe(
      'git+ssh://foo@nvie.com/blah.git',
    );
  });

  test('invalid', () => {
    const decoder = httpsUrl;

    // HTTP URLs are not accepted by default
    expect(() => decoder.verify('http://nvie.com')).toThrow();
    expect(() => decoder.verify('http://nvie.com:80')).toThrow();
    expect(() => decoder.verify('http://nvie.com:80/')).toThrow();

    expect(() => decoder.verify('www.nvie.com')).toThrow('Must be URL');
    expect(() => decoder.verify('bleh://nvie.com')).toThrow(); // Must be HTTPS scheme
    expect(() => decoder.verify('foo')).toThrow('Must be URL');
    expect(() => decoder.verify('me@nvie.com ')).toThrow('Must be URL');
    expect(() => decoder.verify(123)).toThrow('Must be string');
  });
});

describe('nonEmptyString', () => {
  const decoder = nonEmptyString;

  test('valid', () => {
    expect(decoder.verify('x')).toBe('x');
    expect(decoder.verify(' x')).toBe(' x');
    expect(decoder.verify('x ')).toBe('x ');
    expect(decoder.verify('hi')).toBe('hi');
    expect(decoder.verify('hi ')).toBe('hi ');
    expect(decoder.verify(' hi')).toBe(' hi');
    expect(decoder.verify(' hi   ')).toBe(' hi   ');
  });

  test('invalid', () => {
    expect(() => decoder.verify('')).toThrow();
    expect(() => decoder.verify(' ')).toThrow();
    expect(() => decoder.verify('	')).toThrow();
    expect(() => decoder.verify('\n')).toThrow();
    expect(() => decoder.verify('     \n ')).toThrow();
  });
});

describe('numeric', () => {
  const decoder = numeric;

  test('valid', () => {
    expect(decoder.verify('1234567890')).toBe(1234567890);
    expect(decoder.verify('0013')).toBe(13);
  });

  test('invalid', () => {
    expect(() => decoder.verify('')).toThrow();
    expect(() => decoder.verify('1x')).toThrow();
    expect(() => decoder.verify('0x1')).toThrow();
    expect(() => decoder.verify('7e4')).toThrow();
  });

  test('fuzz', () => {
    return fc.assert(
      fc.property(fc.anything(), (input) => {
        if (typeof input === 'string' && !isNaN(Number(input)) && /\S/.test(input)) {
          expect(decoder.verify(input)).toBe(Number(input));
        } else {
          expect(() => decoder.verify(input)).toThrow();
        }
      }),
    );
  });
});

describe('decimal', () => {
  const decoder = decimal;

  test('valid', () => {
    expect(decoder.verify('1234567890')).toBe('1234567890');
    expect(decoder.verify('1')).toBe('1');
  });

  test('invalid', () => {
    expect(() => decoder.verify('')).toThrow();
    expect(() => decoder.verify('1x')).toThrow();
    expect(() => decoder.verify('0x1')).toThrow();
  });

  test('fuzz', () => {
    return fc.assert(
      fc.property(
        fc.anything().filter((x) => typeof x !== 'string' || !/^[0-9]+$/.test(x)),
        (input) => {
          expect(() => decoder.verify(input)).toThrow();
        },
      ),
    );
  });
});

describe('hexadecimal', () => {
  const decoder = hexadecimal;

  test('valid', () => {
    expect(decoder.verify('1234567890abcdef')).toBe('1234567890abcdef');
    expect(decoder.verify('1234567890ABCDEF')).toBe('1234567890ABCDEF');
    expect(decoder.verify('1234567890')).toBe('1234567890');
    expect(decoder.verify('deadBEEF')).toBe('deadBEEF');
    expect(decoder.verify('badCAFE')).toBe('badCAFE');
    expect(decoder.verify('0ff1ce')).toBe('0ff1ce');
    expect(decoder.verify('1')).toBe('1');
  });

  test('invalid', () => {
    expect(() => decoder.verify('')).toThrow();
    expect(() => decoder.verify('1x')).toThrow();
    expect(() => decoder.verify('0xdeadbeef')).toThrow();
  });

  test('fuzz', () => {
    return fc.assert(
      fc.property(
        fc.anything().filter((x) => typeof x !== 'string' || !/^[0-9a-fA-F]+$/.test(x)),
        (input) => {
          expect(() => decoder.verify(input)).toThrow();
        },
      ),
    );
  });
});

describe('nanoid', () => {
  test('default accepts', () => {
    expect(nanoid().verify('1-QskICa3CaPGcKuYYTm1')).toEqual('1-QskICa3CaPGcKuYYTm1');
    expect(nanoid().verify('vA4mt7CUWnouU6jTGbMP_')).toEqual('vA4mt7CUWnouU6jTGbMP_');
    expect(nanoid(7).verify('yH8mx-7')).toEqual('yH8mx-7');
    expect(nanoid(7, 10).verify('yH8mx-7')).toEqual('yH8mx-7');
    expect(nanoid(7, 10).verify('yH8mx-7890')).toEqual('yH8mx-7890');
  });

  test('rejects', () => {
    expect(() => nanoid().verify('x'.repeat(22))).toThrow(/Too long, must be 21 chars/);
    expect(() => nanoid().verify('x'.repeat(20))).toThrow(/Too short, must be 21 chars/);

    // 21 is the default
    expect(() => nanoid(21).verify('x'.repeat(22))).toThrow(/Too long, must be 21 chars/);
    expect(() => nanoid(21).verify('x'.repeat(20))).toThrow(
      /Too short, must be 21 chars/,
    );

    // other size
    expect(() => nanoid(7).verify('x'.repeat(20))).toThrow(/Too long, must be 7 chars/);
    expect(() => nanoid(7).verify('x'.repeat(5))).toThrow(/Too short, must be 7 chars/);

    // range
    expect(() => nanoid(3, 10).verify('x')).toThrow(
      /Too short, must be at least 3 chars/,
    );
    expect(() => nanoid(3, 10).verify('x'.repeat(12))).toThrow(
      /Too long, must be at most 10 chars/,
    );

    expect(() => nanoid(5).verify('$'.repeat(5))).toThrow(/Must be nano ID/);
    expect(() => nanoid().verify(42)).toThrow(/Must be string/);
  });
});

describe('uuid', () => {
  const decoder = uuid;

  test('accepts', () => {
    expect(decoder.verify('123e4567-e89b-12d3-a456-426614174000')).toBe(
      '123e4567-e89b-12d3-a456-426614174000',
    );
    expect(decoder.verify('123e4567-e89b-42d3-a456-426614174000')).toBe(
      '123e4567-e89b-42d3-a456-426614174000',
    );
    expect(decoder.verify('123E4567-E89B-12D3-A456-426614174000')).toBe(
      '123E4567-E89B-12D3-A456-426614174000',
    );
    expect(decoder.verify('123E4567-E89B-42d3-A456-426614174000')).toBe(
      '123E4567-E89B-42d3-A456-426614174000',
    );
  });

  test('rejects', () => {
    expect(decoder.decode('123e4567-e89b-12d3-a456-42661417400x').ok).toBe(false);
    expect(decoder.decode('123e4567e89b12d3a456426614174000').ok).toBe(false);
  });
});

describe('uuidv1', () => {
  const decoder = uuidv1;

  test('accepts', () => {
    expect(uuidv1.verify('123e4567-e89b-12d3-a456-426614174000')).toBe(
      '123e4567-e89b-12d3-a456-426614174000',
    );
    expect(uuidv1.verify('123E4567-E89B-12D3-A456-426614174000')).toBe(
      '123E4567-E89B-12D3-A456-426614174000',
    );
  });

  test('rejects', () => {
    expect(decoder.decode('123e4567-e89b-12d3-a456-42661417400x').ok).toBe(false);
    expect(decoder.decode('123e4567e89b12d3a456426614174000').ok).toBe(false);
  });
});

describe('uuidv4', () => {
  const decoder = uuidv4;

  test('accepts', () => {
    expect(decoder.verify('123e4567-e89b-42d3-a456-426614174000')).toBe(
      '123e4567-e89b-42d3-a456-426614174000',
    );
    expect(decoder.verify('123E4567-E89B-42D3-A456-426614174000')).toBe(
      '123E4567-E89B-42D3-A456-426614174000',
    );
  });

  test('rejects', () => {
    expect(decoder.decode('123e4567-e89b-42d3-a456-42661417400x').ok).toBe(false);
    expect(decoder.decode('123E4567-E89B-12d3-A456-426614174000').ok).toBe(false);
    expect(decoder.decode('123e4567e89b42d3a456426614174000').ok).toBe(false);
  });
});
