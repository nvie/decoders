// @flow

import { partition } from 'itertools';

import { optional } from '../optional';
import { string } from '../string';
import { INPUTS } from './fixtures';

describe('optional', () => {
    const decoder = optional(string);
    const [okay, not_okay] = partition(INPUTS, x => typeof x === 'string');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        expect(decoder(undefined).unwrap()).toBe(undefined);
        for (const value of okay) {
            expect(decoder(value).unwrap()).toBe(value);
        }
    });

    it('allowNull', () => {
        const decoder2 = optional(string, /* allowNull */ true);

        // No difference when decoding undefined
        expect(decoder(undefined).unwrap()).toBeUndefined();
        expect(decoder(undefined).unwrap()).toBeUndefined();

        // No difference when string-decoding
        expect(decoder('').unwrap()).toBe('');
        expect(decoder('foo').unwrap()).toBe('foo');
        expect(decoder2('').unwrap()).toBe('');
        expect(decoder2('foo').unwrap()).toBe('foo');

        // However, when decoding null, the default fails, but the other one succeeds
        expect(() => decoder(null).unwrap()).toThrow();
        expect(decoder2(null).unwrap()).toBeUndefined(); // Even though input is "null", output is "undefined"
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            if (value === undefined) continue;
            expect(decoder(value).isErr()).toBe(true);
        }
    });
});
