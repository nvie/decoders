// @flow strict
/* eslint-disable no-restricted-syntax */

import * as Result from '../Result';
import { INPUTS } from './fixtures';
import { integer, number, positiveInteger, positiveNumber } from '../number';
import { partition } from 'itertools';

describe('number', () => {
    const decoder = number;
    const [okay, not_okay] = partition(INPUTS, (n) => Number.isFinite(n));

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(Result.unwrap(decoder(value))).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(Result.isErr(decoder(value))).toBe(true);
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
            expect(Result.unwrap(decoder(value))).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(Result.isErr(decoder(value))).toBe(true);
        }
    });
});

describe('integer', () => {
    const decoder = integer;
    const [okay, not_okay] = partition(INPUTS, (n) => Number.isInteger(n));

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(Result.unwrap(decoder(value))).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(Result.isErr(decoder(value))).toBe(true);
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
            expect(Result.unwrap(decoder(value))).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(Result.isErr(decoder(value))).toBe(true);
        }
    });
});
