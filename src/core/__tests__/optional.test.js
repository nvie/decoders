// @flow strict
/* eslint-disable no-restricted-syntax */

import { INPUTS } from './fixtures';
import { maybe, nullable, optional } from '../optional';
import { partition } from 'itertools';
import { string } from '../string';

describe('optional', () => {
    const decoder = optional(string);
    const [okay, not_okay] = partition(INPUTS, (x) => typeof x === 'string');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        expect(decoder.verify(undefined)).toBe(undefined);
        for (const value of okay) {
            expect(decoder.verify(value)).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            if (value === undefined) continue;
            expect(decoder.decode(value).ok).toBe(false);
        }
    });
});

describe('nullable', () => {
    const decoder = nullable(string);
    const [okay, not_okay] = partition(INPUTS, (x) => typeof x === 'string');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        expect(decoder.verify(null)).toBe(null);
        for (const value of okay) {
            expect(decoder.verify(value)).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            if (value === null) continue;
            expect(decoder.decode(value).ok).toBe(false);
        }
    });
});

describe('maybe', () => {
    const decoder = maybe(string);
    const [okay, not_okay] = partition(INPUTS, (x) => typeof x === 'string');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        expect(decoder.verify(null)).toBe(null);
        expect(decoder.verify(undefined)).toBe(undefined);
        for (const value of okay) {
            expect(decoder.verify(value)).toBe(value);
        }
    });

    it('allowNull', () => {
        // No difference when decoding undefined
        expect(decoder.verify(undefined)).toBeUndefined();
        expect(decoder.verify(null)).toBeNull();

        // No difference when string-decoding
        expect(decoder.verify('')).toBe('');
        expect(decoder.verify('foo')).toBe('foo');
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            if (value === undefined) continue;
            if (value === null) continue;
            expect(decoder.decode(value).ok).toBe(false);
        }
    });
});
