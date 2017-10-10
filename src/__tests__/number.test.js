// @flow

import { decodeNumber } from '../number';

describe('decodes numbers from JSON', () => {
    const decoder = decodeNumber();

    it('simply returns numbers if inputs are numbers', () => {
        expect(decoder(0)).toBe(0);
        expect(decoder(1)).toBe(1);
        expect(decoder(3.14)).toBeCloseTo(3.14);
        expect(decoder(-13)).toBe(-13);
    });

    it('throws runtime error if inputs are not numbers', () => {
        expect(() => decoder('')).toThrow();
        expect(() => decoder('1')).toThrow();
        expect(() => decoder('not a number')).toThrow();
        expect(() => decoder(true)).toThrow();
        expect(() => decoder(null)).toThrow();
        expect(() => decoder(undefined)).toThrow();
        expect(() => decoder(1 / 0)).toThrow();
    });

    it('throws runtime error if inputs are not _finite_ numbers', () => {
        expect(() => decoder(Number.NEGATIVE_INFINITY)).toThrow();
        expect(() => decoder(Number.POSITIVE_INFINITY)).toThrow();
        expect(() => decoder(NaN)).toThrow();
    });
});
