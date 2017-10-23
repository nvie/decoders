// @flow

import { partition } from 'itertools';

import { anyNumber, integer, number, positiveInteger, positiveNumber } from '../number';
import { INPUTS } from './fixtures';

describe('number', () => {
    const verifier = number;
    const [okay, not_okay] = partition(INPUTS, Number.isFinite);

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(verifier(value).unwrap()).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(verifier(value).isErr()).toBe(true);
        }
    });
});

describe('anyNumber', () => {
    const verifier = anyNumber;
    const [okay, not_okay] = partition(INPUTS, x => typeof x === 'number' && !Number.isNaN(x));

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(verifier(value).unwrap()).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(verifier(value).isErr()).toBe(true);
        }
    });
});

describe('positiveNumber', () => {
    const verifier = positiveNumber;
    const [okay, not_okay] = partition(INPUTS, n => typeof n === 'number' && Number.isFinite(n) && n >= 0);

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(verifier(value).unwrap()).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(verifier(value).isErr()).toBe(true);
        }
    });
});

describe('integer', () => {
    const verifier = integer;
    const [okay, not_okay] = partition(INPUTS, Number.isInteger);

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(verifier(value).unwrap()).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(verifier(value).isErr()).toBe(true);
        }
    });
});

describe('positiveInteger', () => {
    const verifier = positiveInteger;
    const [okay, not_okay] = partition(INPUTS, n => typeof n === 'number' && Number.isInteger(n) && n >= 0);

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(verifier(value).unwrap()).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(verifier(value).isErr()).toBe(true);
        }
    });
});
