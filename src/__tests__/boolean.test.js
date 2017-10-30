// @flow

import { partition } from 'itertools';

import { boolean } from '../boolean';
import { INPUTS } from './fixtures';

describe('boolean', () => {
    const decoder = boolean;
    const [okay, not_okay] = partition(INPUTS, x => x === true || x === false);

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
