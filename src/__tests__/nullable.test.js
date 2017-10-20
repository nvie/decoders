// @flow

import { partition } from 'itertools';

import { nullable } from '../nullable';
import { string } from '../string';
import { INPUTS } from './fixtures';

describe('nullable', () => {
    const verifier = nullable(string);
    const [okay, not_okay] = partition(INPUTS, x => typeof x === 'string');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        expect(verifier(null).unwrap()).toBe(null);
        for (const value of okay) {
            expect(verifier(value).unwrap()).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            if (value === null) continue;
            expect(verifier(value).isErr()).toBe(true);
        }
    });
});
