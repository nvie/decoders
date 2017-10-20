// @flow

import { partition } from 'itertools';

import { string } from '../string';
import { INPUTS } from './fixtures';

describe('string', () => {
    const verifier = string;
    const [okay, not_okay] = partition(INPUTS, x => typeof x === 'string');

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
