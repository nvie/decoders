// @flow

import { partition } from 'itertools';

import { optional } from '../optional';
import { string } from '../string';
import { INPUTS } from './fixtures';

describe('optional', () => {
    const verifier = optional(string);
    const [okay, not_okay] = partition(INPUTS, x => typeof x === 'string');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        expect(verifier(undefined).unwrap()).toBe(undefined);
        for (const value of okay) {
            expect(verifier(value).unwrap()).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            if (value === undefined) continue;
            expect(verifier(value).isErr()).toBe(true);
        }
    });
});
