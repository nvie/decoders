// @flow strict
/* eslint-disable no-restricted-syntax */

import { annotate } from '../../annotate';
import { constant } from '../constants';
import { err, ok } from '../../result';
import { INPUTS } from './fixtures';
import { number } from '../numbers';
import { partition } from 'itertools';
import { prep } from '../composition';
import { string } from '../strings';

describe('compose', () => {
    const hex =
        // We already know how to decode strings...
        string.chain(
            // We'll try to parse it as an hex int, but if it fails, we'll
            // return Err, otherwise Ok
            (s) => {
                const n = parseInt(s, 16);
                return !Number.isNaN(n) ? ok(n) : err(annotate(n, 'Nope'));
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

describe('transform', () => {
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

describe('predicate', () => {
    const odd = number.and((n) => n % 2 !== 0, 'Must be odd');

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

describe('prep', () => {
    const answerToLife = prep((x) => parseInt(x), constant((42: 42)));
    const [okay, not_okay] = partition(INPUTS, (x) => String(x) === '42');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(answerToLife.verify(value)).toBe(42);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(answerToLife.decode(value).ok).toBe(false);
        }
    });

    it('invalid when prep mapper function throws', () => {
        expect(answerToLife.decode(Symbol('foo')).ok).toBe(false);
        //                  ^^^^^^^^^^^^^ This will cause the `Number(x)` call to throw
    });
});
