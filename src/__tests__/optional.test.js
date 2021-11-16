// @flow strict
/* eslint-disable no-restricted-syntax */

import * as Result from '../lib/Result';
import { INPUTS } from './fixtures';
import { maybe, nullable, optional } from '../optional';
import { partition } from 'itertools';
import { string } from '../string';

describe('optional', () => {
    const decoder = optional(string);
    const [okay, not_okay] = partition(INPUTS, (x) => typeof x === 'string');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        expect(Result.unwrap(decoder(undefined))).toBe(undefined);
        for (const value of okay) {
            expect(Result.unwrap(decoder(value))).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            if (value === undefined) continue;
            expect(Result.isErr(decoder(value))).toBe(true);
        }
    });
});

describe('nullable', () => {
    const decoder = nullable(string);
    const [okay, not_okay] = partition(INPUTS, (x) => typeof x === 'string');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        expect(Result.unwrap(decoder(null))).toBe(null);
        for (const value of okay) {
            expect(Result.unwrap(decoder(value))).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            if (value === null) continue;
            expect(Result.isErr(decoder(value))).toBe(true);
        }
    });
});

describe('maybe', () => {
    const decoder = maybe(string);
    const [okay, not_okay] = partition(INPUTS, (x) => typeof x === 'string');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        expect(Result.unwrap(decoder(null))).toBe(null);
        expect(Result.unwrap(decoder(undefined))).toBe(undefined);
        for (const value of okay) {
            expect(Result.unwrap(decoder(value))).toBe(value);
        }
    });

    it('allowNull', () => {
        // No difference when decoding undefined
        expect(Result.unwrap(decoder(undefined))).toBeUndefined();
        expect(Result.unwrap(decoder(null))).toBeNull();

        // No difference when string-decoding
        expect(Result.unwrap(decoder(''))).toBe('');
        expect(Result.unwrap(decoder('foo'))).toBe('foo');
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            if (value === undefined) continue;
            if (value === null) continue;
            expect(Result.isErr(decoder(value))).toBe(true);
        }
    });
});
