// @flow strict

import { annotate } from 'debrief';
import { Err, Ok } from 'lemons/Result';

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
            return !Number.isNaN(n) ? Ok(n) : Err(annotate(n, 'Nope'));
        }
    );

    it('valid type of decode result', () => {
        expect(hex('100').unwrap()).toEqual(256);
        expect(hex('DEADC0DE').unwrap()).toEqual(0xdeadc0de);
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
        expect(len('foo').unwrap()).toEqual(3);
        expect(len('Lorem ipsum dolor sit amet.').unwrap()).toEqual(27);
    });

    it('change value, not type, of decoded results', () => {
        const upcase = map(string, (s) => s.toUpperCase());
        expect(upcase('123').unwrap()).toEqual('123');
        expect(upcase('I am Hulk').unwrap()).toEqual('I AM HULK');
    });

    it('a failing mapper will fail the decoder', () => {
        const odd = map(number, (n) => {
            if (n % 2 !== 0) return n;
            throw new Error('Must be odd');
        });
        expect(odd(13).unwrap()).toEqual(13);
        expect(() => guard(odd)(4)).toThrow('^ Must be odd');
        expect(odd(3).isErr()).toBe(false);
        expect(odd(4).isErr()).toBe(true);

        const weirdEven = map(number, (n) => {
            if (n % 2 === 0) return n;
            throw 'Must be even'; // Throwing a string, not an Error is non-conventional, but won't break anything
        });
        expect(weirdEven(3).isErr()).toBe(true);
        expect(() => guard(weirdEven)(3)).toThrow('^ Must be even');
        expect(weirdEven(4).unwrap()).toEqual(4);
    });
});
