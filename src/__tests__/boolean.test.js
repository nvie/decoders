// @flow

import { boolean } from '../boolean';

describe('boolean', () => {
    const verifier = boolean;

    it('valid', () => {
        const okay = [true, false];
        for (const value of okay) {
            expect(verifier(value).isOk()).toBe(true);
        }
    });

    it('invalid', () => {
        const not_okay = ['', '1', 'not a number', null, undefined, NaN, 1 / 0];
        for (const value of not_okay) {
            expect(verifier(value).isErr()).toBe(true);
        }
    });
});
