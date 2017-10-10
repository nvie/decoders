// @flow

import { decodeBoolean } from '../boolean';

describe('boolean', () => {
    const decoder = decodeBoolean();

    it('valid', () => {
        expect(decoder(false)).toBe(false);
        expect(decoder(true)).toBe(true);
    });

    it('invalid', () => {
        expect(() => decoder('')).toThrow();
        expect(() => decoder('1')).toThrow();
        expect(() => decoder('not a number')).toThrow();
        expect(() => decoder(null)).toThrow();
        expect(() => decoder(undefined)).toThrow();
        expect(() => decoder(NaN)).toThrow();
        expect(() => decoder(1 / 0)).toThrow();
    });
});
