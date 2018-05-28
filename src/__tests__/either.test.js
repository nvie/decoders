// @flow strict

import { partition } from 'itertools';

import { boolean } from '../boolean';
import { constant, undefined_ } from '../constants';
import { either, either4, either9 } from '../either';
import { guard } from '../guard';
import { number } from '../number';
import { string } from '../string';
import { INPUTS } from './fixtures';

describe('either', () => {
    const decoder = guard(either(string, boolean));
    const [okay, not_okay] = partition(INPUTS, x => typeof x === 'string' || typeof x === 'boolean');

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

    it('errors nicely', () => {
        expect(() => decoder(42)).toThrow('Either:');
    });
});

describe('either3', () => {
    const decoder = guard(either4(string, boolean, number, undefined_));
    const [okay, not_okay] = partition(
        INPUTS,
        x => x === undefined || typeof x === 'string' || typeof x === 'boolean' || Number.isFinite(x)
    );

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

describe('either9', () => {
    // By testing either9 we'll cover either8, either7, ...
    const decoder = either9(
        constant('one'),
        constant('two'),
        constant('three'),
        constant('four'),
        constant('five'),
        constant('six'),
        constant('seven'),
        constant('eight'),
        constant('nine')
    );
    const okay = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const not_okay = INPUTS;

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(decoder(value).unwrap()).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(decoder(value).isErr()).toBe(true);
        }
    });
});
