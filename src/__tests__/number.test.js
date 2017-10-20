// @flow

import { partition } from 'itertools';

import { anyNumber, number } from '../number';
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
