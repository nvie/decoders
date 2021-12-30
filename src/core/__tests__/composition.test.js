// @flow strict
/* eslint-disable no-restricted-syntax */

import { annotate } from '../../annotate';
import { compose, predicate, prep, transform } from '../composition';
import { constant } from '../constants';
import { err, ok, unwrap } from '../../result';
import { guard } from '../../_guard';
import { INPUTS } from './fixtures';
import { number } from '../number';
import { partition } from 'itertools';
import { string } from '../string';

describe('compose', () => {
    const hex = compose(
        // We already know how to decode strings...
        string,

        // We'll try to parse it as an hex int, but if it fails, we'll
        // return Err, otherwise Ok
        (s) => {
            const n = parseInt(s, 16);
            return !Number.isNaN(n) ? ok(n) : err(annotate(n, 'Nope'));
        },
    );

    it('valid type of decode result', () => {
        expect(unwrap(hex('100'))).toEqual(256);
        expect(unwrap(hex('DEADC0DE'))).toEqual(0xdeadc0de);
    });

    it('invalid', () => {
        expect(() => guard(hex)('no good hex value')).toThrow('Nope');
    });
});

describe('transform', () => {
    it('change type of decode result', () => {
        const len = transform(string, (s) => s.length);
        expect(unwrap(len('foo'))).toEqual(3);
        expect(unwrap(len('Lorem ipsum dolor sit amet.'))).toEqual(27);
    });

    it('change value, not type, of decoded results', () => {
        const upcase = transform(string, (s) => s.toUpperCase());
        expect(unwrap(upcase('123'))).toEqual('123');
        expect(unwrap(upcase('I am Hulk'))).toEqual('I AM HULK');
    });

    it('a failing transformation function will fail the decoder', () => {
        const odd = transform(number, (n) => {
            if (n % 2 !== 0) return n;
            throw new Error('Must be odd');
        });
        expect(unwrap(odd(13))).toEqual(13);
        expect(() => guard(odd)(4)).toThrow('^ Must be odd');
        expect(odd(3).ok).toBe(true);
        expect(odd(4).ok).toBe(false);

        const weirdEven = transform(number, (n) => {
            if (n % 2 === 0) return n;
            throw 'Must be even'; // Throwing a string, not an Error is non-conventional, but won't break anything
        });
        expect(weirdEven(3).ok).toBe(false);
        expect(() => guard(weirdEven)(3)).toThrow('^ Must be even');
        expect(unwrap(weirdEven(4))).toEqual(4);
    });
});

describe('predicate', () => {
    const odd = predicate(number, (n) => n % 2 !== 0, 'Must be odd');

    it('valid', () => {
        expect(odd(0).ok).toEqual(false);
        expect(odd(1).ok).toEqual(true);
        expect(odd(2).ok).toEqual(false);
        expect(odd(3).ok).toEqual(true);
        expect(odd(4).ok).toEqual(false);
        expect(odd(5).ok).toEqual(true);
        expect(odd(-1).ok).toEqual(true);
        expect(odd(-2).ok).toEqual(false);
        expect(odd(-3).ok).toEqual(true);
        expect(odd(-4).ok).toEqual(false);
        expect(odd(-5).ok).toEqual(true);
    });
});

describe('prep', () => {
    const answerToLife = prep((x) => parseInt(x), constant((42: 42)));
    const [okay, not_okay] = partition(INPUTS, (x) => String(x) === '42');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(unwrap(answerToLife(value))).toBe(42);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(answerToLife(value).ok).toBe(false);
        }
    });

    it('invalid when prep mapper function throws', () => {
        expect(answerToLife(Symbol('foo')).ok).toBe(false);
        //                  ^^^^^^^^^^^^^ This will cause the `Number(x)` call to throw
    });
});
