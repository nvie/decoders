// @flow strict

import { partition } from 'itertools';

import { maybe } from '../maybe';
import { string } from '../string';
import { INPUTS } from './fixtures';

describe('optional', () => {
    const decoder = maybe(string);
    const [okay, not_okay] = partition(INPUTS, x => typeof x === 'string');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        expect(decoder(null).unwrap()).toBe(null);
        expect(decoder(undefined).unwrap()).toBe(undefined);
        for (const value of okay) {
            expect(decoder(value).unwrap()).toBe(value);
        }
    });

    it('allowNull', () => {
        // No difference when decoding undefined
        expect(decoder(undefined).unwrap()).toBeUndefined();
        expect(decoder(null).unwrap()).toBeNull();

        // No difference when string-decoding
        expect(decoder('').unwrap()).toBe('');
        expect(decoder('foo').unwrap()).toBe('foo');
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            if (value === undefined) continue;
            if (value === null) continue;
            expect(decoder(value).isErr()).toBe(true);
        }
    });
});
