// @flow

import { string } from '../string';

describe('string', () => {
    const verifier = string;
    const okay = ['', 'foo', ' 1 2 3 '];
    const not_okay = [
        null,
        false,
        true,
        -1,
        0,
        1,
        3.14,
        -13,
        Number.NEGATIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        NaN,
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
