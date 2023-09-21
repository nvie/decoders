// @flow strict
/* eslint-disable no-restricted-syntax */

import { anyNumber, integer, number, positiveInteger, positiveNumber } from '../numbers';
import { INPUTS } from './_fixtures';
import { partition } from 'itertools';

describe('number', () => {
    const decoder = number;
    const [okay, not_okay] = partition(INPUTS, (n) => Number.isFinite(n));

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(decoder.verify(value)).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(decoder.decode(value).ok).toBe(false);
        }
    });
});

describe('anyNumber', () => {
    const decoder = anyNumber;
    const [okay, not_okay] = partition(INPUTS, (n) => typeof n === 'number');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(decoder.verify(value)).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(decoder.decode(value).ok).toBe(false);
        }
    });
});

describe('positiveNumber', () => {
    const decoder = positiveNumber;
    const [okay, not_okay] = partition(
        INPUTS,
        (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0,
    );

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(decoder.verify(value)).toBe(value === 0 ? 0 : value);
            expect(decoder.verify(value)).not.toBe(-0);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(decoder.decode(value).ok).toBe(false);
        }
    });
});

describe('integer', () => {
    const decoder = integer;
    const [okay, not_okay] = partition(INPUTS, (n) => Number.isInteger(n));

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(decoder.verify(value)).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(decoder.decode(value).ok).toBe(false);
        }
    });
});

describe('positiveInteger', () => {
    const decoder = positiveInteger;
    const [okay, not_okay] = partition(
        INPUTS,
        (n) => typeof n === 'number' && Number.isInteger(n) && n >= 0,
    );

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(decoder.verify(value)).toBe(value === 0 ? 0 : value);
            expect(decoder.verify(value)).not.toBe(-0);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(decoder.decode(value).ok).toBe(false);
        }
    });
});
