// @flow

import { decodeNumber } from '../number';

describe('decodes numbers', () => {
    const decoder = decodeNumber();

    it('simply returns numbers if inputs are numbers', () => {
        expect(decoder(0)).toBe(0);
        expect(decoder(1)).toBe(1);
        expect(decoder(3.14)).toBeCloseTo(3.14);
        expect(decoder(-13)).toBe(-13);
    });

    it('throws runtime error if inputs are not _finite_ numbers', () => {
        expect(() => decoder(Number.NEGATIVE_INFINITY)).toThrow('Number must be finite');
        expect(() => decoder(Number.POSITIVE_INFINITY)).toThrow('Number must be finite');
        expect(() => decoder(NaN)).toThrow('Must be number');
    });

    it('throws runtime error if inputs are not numbers', () => {
        expect(() => decoder('')).toThrow('Must be number');
        expect(() => decoder('1')).toThrow('Must be number');
        expect(() => decoder('not a number')).toThrow('Must be number');
        expect(() => decoder(true)).toThrow('Must be number');
        expect(() => decoder(null)).toThrow('Must be number');
        expect(() => decoder(undefined)).toThrow('Must be number');
        expect(() => decoder(NaN)).toThrow('Must be number, got NaN');

        // Dividing by zero makes it infinity
        expect(() => decoder(1 / 0)).toThrow('Number must be finite');
        expect(() => decoder(Number.NEGATIVE_INFINITY)).toThrow('Number must be finite');
        expect(() => decoder(Number.POSITIVE_INFINITY)).toThrow('Number must be finite');
    });

    it('decode infinite numbers when requested', () => {
        const decoder = decodeNumber(/* allowInfinity */ true);
        expect(decoder(Number.NEGATIVE_INFINITY)).toEqual(Number.NEGATIVE_INFINITY);
        expect(decoder(Number.POSITIVE_INFINITY)).toEqual(Number.POSITIVE_INFINITY);

        // NaN still causes issues
        expect(() => decoder(NaN)).toThrow('Must be number, got NaN');
    });
});
