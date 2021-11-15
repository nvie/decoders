// @flow strict
/* eslint-disable no-restricted-syntax */

import { annotate } from 'debrief';

import * as Result from '../Result';
import { guard } from '../guard';
import { number } from '../number';
import { string } from '../string';
import { compose, map } from '../utils';

describe('compose', () => {
    const hex = compose(
        // We already know how to decode strings...
        string,

        // We'll try to parse it as an hex int, but if it fails, we'll
        // return Err, otherwise Ok
        (s) => {
            const n = parseInt(s, 16);
            return !Number.isNaN(n) ? Result.ok(n) : Result.err(annotate(n, 'Nope'));
        },
    );

    it('valid type of decode result', () => {
        expect(Result.unwrap(hex('100'))).toEqual(256);
        expect(Result.unwrap(hex('DEADC0DE'))).toEqual(0xdeadc0de);
    });

    it('invalid', () => {
        expect(() => guard(hex)('no good hex value')).toThrow('Nope');
    });
});

describe('map', () => {
    it('change type of decode result', () => {
        // s.length can never fail, so this is a good candidate for map() over
        // compose()
        const len = map(string, (s) => s.length);
        expect(Result.unwrap(len('foo'))).toEqual(3);
        expect(Result.unwrap(len('Lorem ipsum dolor sit amet.'))).toEqual(27);
    });

    it('change value, not type, of decoded results', () => {
        const upcase = map(string, (s) => s.toUpperCase());
        expect(Result.unwrap(upcase('123'))).toEqual('123');
        expect(Result.unwrap(upcase('I am Hulk'))).toEqual('I AM HULK');
    });

    it('a failing mapper will fail the decoder', () => {
        const odd = map(number, (n) => {
            if (n % 2 !== 0) return n;
            throw new Error('Must be odd');
        });
        expect(Result.unwrap(odd(13))).toEqual(13);
        expect(() => guard(odd)(4)).toThrow('^ Must be odd');
        expect(Result.isErr(odd(3))).toBe(false);
        expect(Result.isErr(odd(4))).toBe(true);

        const weirdEven = map(number, (n) => {
            if (n % 2 === 0) return n;
            throw 'Must be even'; // Throwing a string, not an Error is non-conventional, but won't break anything
        });
        expect(Result.isErr(weirdEven(3))).toBe(true);
        expect(() => guard(weirdEven)(3)).toThrow('^ Must be even');
        expect(Result.unwrap(weirdEven(4))).toEqual(4);
    });
});
