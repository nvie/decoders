// @flow strict
/* eslint-disable no-restricted-syntax */

import { partition } from 'itertools';

import { constant, hardcoded, mixed, null_, undefined_ } from '../constants';
import { INPUTS } from './fixtures';
import { isErr, unwrap } from '../Result';

describe('null', () => {
    const decoder = null_;
    const [okay, not_okay] = partition(INPUTS, (x) => x === null);

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(unwrap(decoder(value))).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(isErr(decoder(value))).toBe(true);
        }
    });
});

describe('undefined', () => {
    const decoder = undefined_;
    const [okay, not_okay] = partition(INPUTS, (x) => x === undefined);

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(unwrap(decoder(value))).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(isErr(decoder(value))).toBe(true);
        }
    });
});

describe('string constants', () => {
    const decoder = constant('foo');
    const [okay, not_okay] = partition(INPUTS, (x) => x === 'foo');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(unwrap(decoder(value))).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(isErr(decoder(value))).toBe(true);
        }
    });
});

describe('number constants', () => {
    const decoder = constant(42);
    const [okay, not_okay] = partition(INPUTS, (x) => x === 42);

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(unwrap(decoder(value))).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(isErr(decoder(value))).toBe(true);
        }
    });
});

describe('boolean constants #1', () => {
    const decoder = constant(true);
    const [okay, not_okay] = partition(INPUTS, (x) => x === true);

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(unwrap(decoder(value))).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(isErr(decoder(value))).toBe(true);
        }
    });
});

describe('boolean constants #2', () => {
    const decoder = constant(false);
    const [okay, not_okay] = partition(INPUTS, (x) => x === false);

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(unwrap(decoder(value))).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(isErr(decoder(value))).toBe(true);
        }
    });
});

describe('hardcoded value', () => {
    it('valid', () => {
        // Test all hardcoded inputs...
        for (const hardcodedValue of INPUTS) {
            if (Number.isNaN(hardcodedValue)) {
                // Skip NaN, as we can't compare those for our test cases...
                continue;
            }

            const decoder = hardcoded(hardcodedValue);

            // Against all inputs...
            for (const input of INPUTS) {
                expect(unwrap(decoder(input))).toBe(hardcodedValue);
            }
        }
    });

    it('invalid', () => {
        // hardcoded verifiers never fail
    });
});

describe('mixed (pass-thru)', () => {
    it('valid', () => {
        // Test all hardcoded inputs...
        const decoder = mixed;

        // Against all inputs...
        for (const input of INPUTS) {
            expect(unwrap(decoder(input))).toBe(input);
        }
    });

    it('mixed', () => {
        // mixed verifiers never fail
    });
});
