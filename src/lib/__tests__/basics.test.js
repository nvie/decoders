// @flow strict
/* eslint-disable no-restricted-syntax */

import {
    constant,
    hardcoded,
    maybe,
    mixed,
    null_,
    nullable,
    optional,
    undefined_,
} from '../basics';
import { INPUTS } from './_fixtures';
import { partition } from 'itertools';
import { string } from '../strings';

describe('null_', () => {
    const decoder = null_;
    const [okay, not_okay] = partition(INPUTS, (x) => x === null);

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(decoder.verify(value)).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(decoder.decode(value).ok).toBe(false);
        }
    });
});

describe('undefined_', () => {
    const decoder = undefined_;
    const [okay, not_okay] = partition(INPUTS, (x) => x === undefined);

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(decoder.verify(value)).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(decoder.decode(value).ok).toBe(false);
        }
    });
});

describe('string constants', () => {
    const decoder = constant('foo');
    const [okay, not_okay] = partition(INPUTS, (x) => x === 'foo');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(decoder.verify(value)).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(decoder.decode(value).ok).toBe(false);
        }
    });
});

describe('number constants', () => {
    const decoder = constant(42);
    const [okay, not_okay] = partition(INPUTS, (x) => x === 42);

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(decoder.verify(value)).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(decoder.decode(value).ok).toBe(false);
        }
    });
});

describe('boolean constants #1', () => {
    const decoder = constant(true);
    const [okay, not_okay] = partition(INPUTS, (x) => x === true);

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(decoder.verify(value)).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(decoder.decode(value).ok).toBe(false);
        }
    });
});

describe('boolean constants #2', () => {
    const decoder = constant(false);
    const [okay, not_okay] = partition(INPUTS, (x) => x === false);

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(decoder.verify(value)).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(decoder.decode(value).ok).toBe(false);
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
                expect(decoder.verify(input)).toBe(hardcodedValue);
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
            expect(decoder.verify(input)).toBe(input);
        }
    });

    it('mixed', () => {
        // mixed verifiers never fail
    });
});

describe('optional', () => {
    const decoder = optional(string);
    const [okay, not_okay] = partition(INPUTS, (x) => typeof x === 'string');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        expect(decoder.verify(undefined)).toBe(undefined);
        for (const value of okay) {
            expect(decoder.verify(value)).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            if (value === undefined) continue;
            expect(decoder.decode(value).ok).toBe(false);
        }
    });

    it('w/ default value', () => {
        const DEFAULT_VALUE = 42;
        const decoder = optional(string, DEFAULT_VALUE);
        expect(decoder.verify('foo')).toBe('foo');
        expect(decoder.verify('')).toBe('');
        expect(decoder.verify(undefined)).toBe(DEFAULT_VALUE);

        expect(() => decoder.verify(null)).toThrow();
        expect(() => decoder.verify(123)).toThrow();
    });
});

describe('nullable', () => {
    const decoder = nullable(string);
    const [okay, not_okay] = partition(INPUTS, (x) => typeof x === 'string');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        expect(decoder.verify(null)).toBe(null);
        for (const value of okay) {
            expect(decoder.verify(value)).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            if (value === null) continue;
            expect(decoder.decode(value).ok).toBe(false);
        }
    });

    it('w/ default value', () => {
        const DEFAULT_VALUE = 42;
        const decoder = nullable(string, DEFAULT_VALUE);
        expect(decoder.verify('foo')).toBe('foo');
        expect(decoder.verify('')).toBe('');
        expect(decoder.verify(null)).toBe(DEFAULT_VALUE);

        expect(() => decoder.verify(undefined)).toThrow();
        expect(() => decoder.verify(123)).toThrow();
    });
});

describe('maybe', () => {
    const decoder = maybe(string);
    const [okay, not_okay] = partition(INPUTS, (x) => typeof x === 'string');

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        expect(decoder.verify(null)).toBe(null);
        expect(decoder.verify(undefined)).toBe(undefined);
        for (const value of okay) {
            expect(decoder.verify(value)).toBe(value);
        }
    });

    it('allowNull', () => {
        // No difference when decoding undefined
        expect(decoder.verify(undefined)).toBeUndefined();
        expect(decoder.verify(null)).toBeNull();

        // No difference when string-decoding
        expect(decoder.verify('')).toBe('');
        expect(decoder.verify('foo')).toBe('foo');
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            if (value === undefined) continue;
            if (value === null) continue;
            expect(decoder.decode(value).ok).toBe(false);
        }
    });

    it('w/ default value', () => {
        const DEFAULT_VALUE = 42;
        const decoder = maybe(string, DEFAULT_VALUE);
        expect(decoder.verify('foo')).toBe('foo');
        expect(decoder.verify('')).toBe('');
        expect(decoder.verify(null)).toBe(DEFAULT_VALUE);
        expect(decoder.verify(undefined)).toBe(DEFAULT_VALUE);

        expect(() => decoder.verify(123)).toThrow();
    });
});
