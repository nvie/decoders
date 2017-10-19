// @flow

import { number, anyNumber } from '../number';

describe('number', () => {
    const verifier = number;
    const okay = [0, 1, 3.14, -13];
    const not_okay = [
        null,
        true,
        '',
        '1',
        'not a number',
        NaN,
        Number.NEGATIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        undefined,
    ];

    it('valid', () => {
        for (const value of okay) {
            expect(verifier(value).unwrap()).toBe(value);
        }
    });

    it('invalid', () => {
        for (const value of not_okay) {
            expect(verifier(value).isErr()).toBe(true);
        }
    });
});

describe('anyNumber', () => {
    const verifier = anyNumber;
    const okay = [
        0,
        1,
        3.14,
        -13,

        // Compared to "normal" numbers, these "special" values will also be found to be OK
        Number.NEGATIVE_INFINITY,
        Number.POSITIVE_INFINITY,
    ];
    const not_okay = [null, true, '', '1', 'not a number', NaN, undefined];

    it('valid', () => {
        for (const value of okay) {
            expect(verifier(value).unwrap()).toBe(value);
        }
    });

    it('invalid', () => {
        for (const value of not_okay) {
            expect(verifier(value).isErr()).toBe(true);
        }
    });
});
