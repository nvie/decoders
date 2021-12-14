// @flow strict
/* eslint-disable no-restricted-syntax */

import { INPUTS } from './fixtures';
import { maybe, nullable, optional } from '../optional';
import { partition } from 'itertools';
import { string } from '../string';
import { unwrap } from '../../result';

describe('optional', () => {
    const decoder = optional(string);
    const [okay, not_okay] = partition(INPUTS, (x) => typeof x === 'string');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        expect(unwrap(decoder(undefined))).toBe(undefined);
        for (const value of okay) {
            expect(unwrap(decoder(value))).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            if (value === undefined) continue;
            expect(decoder(value).type).toBe('err');
        }
    });
});

describe('nullable', () => {
    const decoder = nullable(string);
    const [okay, not_okay] = partition(INPUTS, (x) => typeof x === 'string');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        expect(unwrap(decoder(null))).toBe(null);
        for (const value of okay) {
            expect(unwrap(decoder(value))).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            if (value === null) continue;
            expect(decoder(value).type).toBe('err');
        }
    });
});

describe('maybe', () => {
    const decoder = maybe(string);
    const [okay, not_okay] = partition(INPUTS, (x) => typeof x === 'string');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        expect(unwrap(decoder(null))).toBe(null);
        expect(unwrap(decoder(undefined))).toBe(undefined);
        for (const value of okay) {
            expect(unwrap(decoder(value))).toBe(value);
        }
    });

    it('allowNull', () => {
        // No difference when decoding undefined
        expect(unwrap(decoder(undefined))).toBeUndefined();
        expect(unwrap(decoder(null))).toBeNull();

        // No difference when string-decoding
        expect(unwrap(decoder(''))).toBe('');
        expect(unwrap(decoder('foo'))).toBe('foo');
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            if (value === undefined) continue;
            if (value === null) continue;
            expect(decoder(value).type).toBe('err');
        }
    });
});
