// @flow strict

import { annotate } from '../annotate';
import { formatInline, formatShort } from '../format';
import { number } from '../lib/numbers';
import { pojo } from '../lib/objects';
import { string } from '../lib/strings';

describe('.decode', () => {
    // .decode() is tested implicitly because it's used _everywhere_
});

describe('.verify', () => {
    it('valid', () => {
        const decoder = number;
        expect(decoder.verify(0)).toBe(0);
        expect(decoder.verify(1)).toBe(1);
        expect(decoder.verify(4)).toBe(4);
        expect(decoder.verify(-3)).toBe(-3);
        expect(decoder.verify(-3.14)).toBe(-3.14);
    });

    it('invalid', () => {
        const decoder = number;
        expect(() => decoder.verify('foo')).toThrow('Must be number');
    });

    it('different erroring styles', () => {
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

describe('.value', () => {
    it('valid', () => {
        const decoder = number;
        expect(decoder.value(0)).toBe(0);
        expect(decoder.value(1)).toBe(1);
        expect(decoder.value(4)).toBe(4);
        expect(decoder.value(-3)).toBe(-3);
        expect(decoder.value(-3.14)).toBe(-3.14);
    });

    it('invalid', () => {
        const decoder = number;
        expect(decoder.value('foo')).toBeUndefined();
    });
});

describe('.then', () => {
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

    it('valid type of decode result', () => {
        expect(hex.verify('100')).toEqual(256);
        expect(hex.verify('DEADC0DE')).toEqual(0xdeadc0de);
    });

    it('invalid', () => {
        expect(() => hex.verify('no good hex value')).toThrow('Nope');
    });
});

describe('.transform', () => {
    it('change type of decode result', () => {
        const len = string.transform((s) => s.length);
        expect(len.verify('foo')).toEqual(3);
        expect(len.verify('Lorem ipsum dolor sit amet.')).toEqual(27);
    });

    it('change value, not type, of decoded results', () => {
        const upcase = string.transform((s) => s.toUpperCase());
        expect(upcase.verify('123')).toEqual('123');
        expect(upcase.verify('I am Hulk')).toEqual('I AM HULK');
    });

    it('a failing transformation function will fail the decoder', () => {
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

describe('.refine', () => {
    const odd = number.refine((n) => n % 2 !== 0, 'Must be odd');

    it('valid', () => {
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

describe('.reject (simple)', () => {
    const decoder = pojo.reject((obj) => {
        const badKeys = Object.keys(obj).filter((key) => key.startsWith('_'));
        return badKeys.length > 0 ? `Disallowed keys: ${badKeys.join(', ')}` : null;
    });

    it('valid', () => {
        expect(decoder.decode({ id: 123, name: 'Bob' }).ok).toEqual(true);
        expect(() => decoder.verify({ id: 123, _x: 123, _y: 'Bob' })).toThrow(
            /Disallowed keys: _x, _y/,
        );
    });
});

describe('.reject (w/ Annotation)', () => {
    const odd = number.reject((n) =>
        n % 2 === 0 ? annotate('***', "Can't show ya, but this must be odd") : null,
    );

    it('valid', () => {
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

describe('.describe', () => {
    const decoder = string.describe('Must be text');

    it('valid', () => {
        expect(decoder.verify('foo')).toBe('foo');
        expect(decoder.verify('')).toBe('');
    });

    it('invalid', () => {
        expect(() => decoder.verify(0)).toThrow(/Must be text/);
    });
});
