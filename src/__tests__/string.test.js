// @flow strict

import { partition } from 'itertools';

import { guard } from '../guard';
import { email, regex, string, url } from '../string';
import { INPUTS } from './fixtures';

describe('string', () => {
    const decoder = guard(string);
    const [okay, not_okay] = partition(INPUTS, x => typeof x === 'string');

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

describe('string', () => {
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
    const decoder = guard(url());

    it('valid', () => {
        expect(decoder('https://nvie.com')).toBe('https://nvie.com');
        expect(decoder('https://user:pass@nvie.com:443/foo?q=bar&b=baz#qux')).toBe(
            'https://user:pass@nvie.com:443/foo?q=bar&b=baz#qux'
        );
        expect(decoder('https://res.example.com/a_b,c_1d/foo.svg')).toBe('https://res.example.com/a_b,c_1d/foo.svg');
    });

    it('custom URL schemes', () => {
        const decoder = guard(url(['http', 'git+ssh', 'ftp']));
        expect(decoder('http://nvie.com')).toBe('http://nvie.com');
        expect(decoder('ftp://nvie.com:80/')).toBe('ftp://nvie.com:80/');
        expect(decoder('git+ssh://foo@nvie.com/blah.git')).toBe('git+ssh://foo@nvie.com/blah.git');
    });

    it('invalid', () => {
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
