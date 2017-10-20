// @flow

import { partition } from 'itertools';

import { Null, Undefined, constant, hardcoded } from '../constants';
import { INPUTS } from './fixtures';

describe('null', () => {
    const verifier = Null;
    const [okay, not_okay] = partition(INPUTS, x => x === null);

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

describe('undefined', () => {
    const verifier = Undefined;
    const [okay, not_okay] = partition(INPUTS, x => x === undefined);

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

describe('string constants', () => {
    const verifier = constant('foo');
    const [okay, not_okay] = partition(INPUTS, x => x === 'foo');

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

describe('number constants', () => {
    const verifier = constant(42);
    const [okay, not_okay] = partition(INPUTS, x => x === 42);

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

describe('boolean constants #1', () => {
    const verifier = constant(true);
    const [okay, not_okay] = partition(INPUTS, x => x === true);

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

describe('boolean constants #2', () => {
    const verifier = constant(false);
    const [okay, not_okay] = partition(INPUTS, x => x === false);

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

describe('hardcoded value', () => {
    it('valid', () => {
        // Test all hardcoded inputs...
        for (const hardcodedValue of INPUTS) {
            if (Number.isNaN(hardcodedValue)) {
                // Skip NaN, as we can't compare those for our test cases...
                continue;
            }

            const verifier = hardcoded(hardcodedValue);

            // Against all inputs...
            for (const input of INPUTS) {
                expect(verifier(input).unwrap()).toBe(hardcodedValue);
            }
        }
    });

    it('invalid', () => {
        // hardcoded verifiers never fail
    });
});
