// @flow

import { nullable } from '../nullable';
import { decodeNumber } from '../number';

describe('nullable', () => {
    it('composes nullable decoders', () => {
        // First, show that "normal" decodeNumber does not accept undefined
        const dec = decodeNumber();
        expect(dec(123)).toEqual(123);
        expect(() => dec(null)).toThrow();
        expect(() => dec(undefined)).toThrow();

        // But wrapping it in an optional will allow just that
        const opt = nullable(dec);
        expect(opt(123)).toEqual(123);
        // expect(opt(null)).toBeNull();
        expect(() => dec(undefined)).toThrow();
    });
});
