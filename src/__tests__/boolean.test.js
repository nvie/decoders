// @flow strict
/* eslint-disable no-restricted-syntax */

import { partition } from 'itertools';

import * as Result from '../Result';
import { boolean, numericBoolean, truthy } from '../boolean';
import { INPUTS } from './fixtures';

describe('booleans', () => {
    const decoder = boolean;
    const [okay, not_okay] = partition(INPUTS, (x) => x === true || x === false);

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

describe('truthy', () => {
    const decoder = truthy;
    const okay = INPUTS;

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(Result.unwrap(decoder(value))).toBe(!!value);
        }
    });

    it('invalid', () => {
        // truthy never fails
    });
});

describe('numeric booleans', () => {
    const decoder = numericBoolean;
    const [okay, not_okay] = partition(INPUTS, (x) => Number.isFinite(x));

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(Result.unwrap(decoder(value))).toBe(!!value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(Result.isErr(decoder(value))).toBe(true);
        }
    });
});
