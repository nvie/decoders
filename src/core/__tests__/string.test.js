// @flow strict
/* globals URL */
/* eslint-disable no-restricted-syntax */

import {
    email,
    httpsUrl,
    nonEmptyString,
    regex,
    string,
    url,
    uuid,
    uuidv1,
    uuidv4,
} from '../string';
import { guard } from '../../_guard';
import { INPUTS } from './fixtures';
import { partition } from 'itertools';
import { predicate } from '../composition';

describe('string', () => {
    const decoder = guard(string);
    const [okay, not_okay] = partition(INPUTS, (x) => typeof x === 'string');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(decoder(value)).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(() => decoder(value)).toThrow();
        }
    });
});

describe('regex', () => {
    const decoder = guard(regex(/[0-9]{4}-[0-9]{2}-[0-9]{2}/, 'Must be YYYY-MM-DD'));

    it('valid', () => {
        expect(decoder('2017-12-16')).toBe('2017-12-16');
        expect(decoder('1999-99-55')).toBe('1999-99-55'); // Remember, just regexes not valid dates! ;)
        expect(decoder("Party like it's 1999-01-01")).toBe("Party like it's 1999-01-01"); // Remember, regex is unbounded
    });

    it('invalid', () => {
        expect(() => decoder(42)).toThrow('Must be string'); // All regexes must be strings
        expect(() => decoder('11-22-33')).toThrow('Must be YYYY-MM-DD');
        expect(() => decoder('invalid')).toThrow('Must be YYYY-MM-DD');
    });
});

describe('email', () => {
    const decoder = guard(email);

    it('valid', () => {
        const valids = [
            'test@yahoo.com',
            'foo-BAR@gmail.com',
            'no-reply+blah-12345678901234567@mail.foobar.qoz',
            'a@b.co',
        ];
        for (const valid of valids) {
            expect(decoder(valid)).toBe(valid);
        }
    });

    it('invalid', () => {
        const invalids = [
            '',
            'foo',
            'foobar@gmail',
            'me@nvie.com ', // Note the trailing space
        ];
        for (const invalid of invalids) {
            expect(() => decoder(invalid)).toThrow('Must be email');
        }
        expect(() => decoder(123)).toThrow('Must be string');
    });
});

describe('url', () => {
    const decoder = guard(url);

    it('valid', () => {
        expect(decoder(new URL('https://nvie.com/')).toString()).toEqual(
            'https://nvie.com/',
        );
        expect(decoder('https://nvie.com').toString()).toEqual('https://nvie.com/');
        expect(
            decoder('https://user:pass@nvie.com:443/foo?q=bar&b=baz#qux').toString(),
        ).toBe('https://user:pass@nvie.com/foo?q=bar&b=baz#qux');
        expect(decoder('https://res.example.com/a_b,c_1d/foo.svg').toString()).toBe(
            'https://res.example.com/a_b,c_1d/foo.svg',
        );
    });

    it('custom URL schemes', () => {
        const decoder = guard(
            predicate(
                url,
                (value) => ['http:', 'git+ssh:', 'ftp:'].includes(value.protocol),
                'Must be http, git+ssh, or ftp URL',
            ),
        );
        expect(decoder('http://nvie.com').toString()).toBe('http://nvie.com/');
        expect(decoder('ftp://nvie.com:80/').toString()).toBe('ftp://nvie.com:80/');
        expect(decoder('git+ssh://foo@nvie.com/blah.git').toString()).toBe(
            'git+ssh://foo@nvie.com/blah.git',
        );
    });

    it('invalid', () => {
        const decoder = guard(httpsUrl);

        // HTTP URLs are not accepted by default
        expect(() => decoder('http://nvie.com')).toThrow();
        expect(() => decoder('http://nvie.com:80')).toThrow();
        expect(() => decoder('http://nvie.com:80/')).toThrow();

        expect(() => decoder('www.nvie.com')).toThrow('Must be URL');
        expect(() => decoder('bleh://nvie.com')).toThrow(); // Must be HTTPS scheme
        expect(() => decoder('foo')).toThrow('Must be URL');
        expect(() => decoder('me@nvie.com ')).toThrow('Must be URL');
        expect(() => decoder(123)).toThrow('Must be string');
    });
});

describe('nonEmptyString', () => {
    const decoder = guard(nonEmptyString);

    it('valid', () => {
        expect(decoder('x')).toBe('x');
        expect(decoder(' x')).toBe(' x');
        expect(decoder('x ')).toBe('x ');
        expect(decoder('hi')).toBe('hi');
        expect(decoder('hi ')).toBe('hi ');
        expect(decoder(' hi')).toBe(' hi');
        expect(decoder(' hi   ')).toBe(' hi   ');
    });

    it('invalid', () => {
        expect(() => decoder('')).toThrow();
        expect(() => decoder(' ')).toThrow();
        expect(() => decoder('	')).toThrow();
        expect(() => decoder('\n')).toThrow();
        expect(() => decoder('     \n ')).toThrow();
    });
});

describe('uuid', () => {
    const decoder = uuid;

    it('accepts', () => {
        expect(decoder('123e4567-e89b-12d3-a456-426614174000').value).toBe(
            '123e4567-e89b-12d3-a456-426614174000',
        );
        expect(decoder('123e4567-e89b-42d3-a456-426614174000').value).toBe(
            '123e4567-e89b-42d3-a456-426614174000',
        );
        expect(decoder('123E4567-E89B-12D3-A456-426614174000').value).toBe(
            '123E4567-E89B-12D3-A456-426614174000',
        );
        expect(decoder('123E4567-E89B-42d3-A456-426614174000').value).toBe(
            '123E4567-E89B-42d3-A456-426614174000',
        );
    });

    it('rejects', () => {
        expect(decoder('123e4567-e89b-12d3-a456-42661417400x').ok).toBe(false);
        expect(decoder('123e4567e89b12d3a456426614174000').ok).toBe(false);
    });
});

describe('uuidv1', () => {
    const decoder = uuidv1;

    it('accepts', () => {
        expect(uuidv1('123e4567-e89b-12d3-a456-426614174000').value).toBe(
            '123e4567-e89b-12d3-a456-426614174000',
        );
        expect(uuidv1('123E4567-E89B-12D3-A456-426614174000').value).toBe(
            '123E4567-E89B-12D3-A456-426614174000',
        );
    });

    it('rejects', () => {
        expect(decoder('123e4567-e89b-12d3-a456-42661417400x').ok).toBe(false);
        expect(decoder('123e4567e89b12d3a456426614174000').ok).toBe(false);
    });
});

describe('uuidv4', () => {
    const decoder = uuidv4;

    it('accepts', () => {
        expect(decoder('123e4567-e89b-42d3-a456-426614174000').value).toBe(
            '123e4567-e89b-42d3-a456-426614174000',
        );
        expect(decoder('123E4567-E89B-42D3-A456-426614174000').value).toBe(
            '123E4567-E89B-42D3-A456-426614174000',
        );
    });

    it('rejects', () => {
        expect(decoder('123e4567-e89b-42d3-a456-42661417400x').ok).toBe(false);
        expect(decoder('123E4567-E89B-12d3-A456-426614174000').ok).toBe(false);
        expect(decoder('123e4567e89b42d3a456426614174000').ok).toBe(false);
    });
});
