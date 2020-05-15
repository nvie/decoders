// @flow strict

import { partition } from 'itertools';

import { integer, number, positiveInteger, positiveNumber } from '../number';
import { INPUTS } from './fixtures';

describe('number', () => {
    const decoder = number;
    const [okay, not_okay] = partition(INPUTS, Number.isFinite);

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

describe('positiveNumber', () => {
    const decoder = positiveNumber;
    const [okay, not_okay] = partition(INPUTS, (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0);

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

describe('integer', () => {
    const decoder = integer;
    const [okay, not_okay] = partition(INPUTS, Number.isInteger);

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

describe('positiveInteger', () => {
    const decoder = positiveInteger;
    const [okay, not_okay] = partition(INPUTS, (n) => typeof n === 'number' && Number.isInteger(n) && n >= 0);

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
