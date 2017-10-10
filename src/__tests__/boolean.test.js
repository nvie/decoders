// @flow

import { decodeBoolean } from '../boolean';

describe('decodes booleans from JSON', () => {
    const decoder = decodeBoolean();

    it('simply returns booleans if inputs are booleans', () => {
        expect(decoder(false)).toBe(false);
        expect(decoder(true)).toBe(true);
    });

    it('throws runtime error if inputs are not booleans', () => {
        expect(() => decoder('')).toThrow();
        expect(() => decoder('1')).toThrow();
        expect(() => decoder('not a number')).toThrow();
        expect(() => decoder(null)).toThrow();
        expect(() => decoder(undefined)).toThrow();
        expect(() => decoder(NaN)).toThrow();
        expect(() => decoder(1 / 0)).toThrow();
    });
});
