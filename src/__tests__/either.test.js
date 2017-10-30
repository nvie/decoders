// @flow

import { partition } from 'itertools';

import { boolean } from '../boolean';
import { undefined_ } from '../constants';
import { either, either4 } from '../either';
import { number } from '../number';
import { string } from '../string';
import { INPUTS } from './fixtures';

describe('either', () => {
    const decoder = either(string, boolean);
    const [okay, not_okay] = partition(INPUTS, x => typeof x === 'string' || typeof x === 'boolean');

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

describe('either3', () => {
    const decoder = either4(string, boolean, number, undefined_);
    const [okay, not_okay] = partition(
        INPUTS,
        x => x === undefined || typeof x === 'string' || typeof x === 'boolean' || Number.isFinite(x)
    );

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
