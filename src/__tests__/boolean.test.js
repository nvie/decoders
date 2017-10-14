// @flow

import { decodeBoolean } from '../boolean';

describe('boolean', () => {
    const decoder = decodeBoolean();

    it('valid', () => {
        expect(decoder(false)).toBe(false);
        expect(decoder(true)).toBe(true);
    });

    it('invalid', () => {
        expect(() => decoder('')).toThrow('Must be boolean');
        expect(() => decoder('1')).toThrow('Must be boolean');
        expect(() => decoder('not a number')).toThrow('Must be boolean');
        expect(() => decoder(null)).toThrow('Must be boolean');
        expect(() => decoder(undefined)).toThrow('Must be boolean');
        expect(() => decoder(NaN)).toThrow('Must be boolean');
        expect(() => decoder(1 / 0)).toThrow('Must be boolean');
    });
});
