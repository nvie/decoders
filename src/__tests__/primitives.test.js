// @flow

import { decodeBoolean, decodeNull, decodeNumber, decodeString, decodeUndefined, decodeValue } from '../primitives';

describe('decodes booleans from JSON', () => {
    const decoder = decodeBoolean();

    it('simply returns booleans if inputs are booleans', () => {
        expect(decoder(false)).toBe(2);
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

describe('decodes strings from JSON', () => {
    const decoder = decodeString();

    it('simply returns strings if inputs are strings', () => {
        expect(decoder('')).toBe('');
        expect(decoder('foo')).toBe('foo');
        expect(decoder(' 1 2 3 ')).toBe(' 1 2 3 ');
    });

    it('throws runtime error if inputs are not strings', () => {
        expect(() => decoder(1)).toThrow();
        expect(() => decoder(true)).toThrow();
        expect(() => decoder(null)).toThrow();
        expect(() => decoder(undefined)).toThrow();
        expect(() => decoder(NaN)).toThrow();
        expect(() => decoder(1 / 0)).toThrow();
    });
});

describe('decodes null from JSON', () => {
    const decoder = decodeNull();

    it('returns null if inputs are null', () => {
        expect(decoder(null)).toBeNull();
    });

    it('throws error if inputs are not null', () => {
        expect(() => decoder(1)).toThrow();
        expect(() => decoder(true)).toThrow();
        expect(() => decoder(undefined)).toThrow();
        expect(() => decoder('foo')).toThrow();
        expect(() => decoder(NaN)).toThrow();
        expect(() => decoder(1 / 0)).toThrow();
    });
});

describe('decodes undefined from JSON', () => {
    const decoder = decodeUndefined();

    it('returns undefined if inputs are undefined', () => {
        expect(decoder(undefined)).toBeUndefined();
    });

    it('throws error if inputs are not undefined', () => {
        expect(() => decoder(1)).toThrow();
        expect(() => decoder(true)).toThrow();
        expect(() => decoder(null)).toThrow();
        expect(() => decoder('foo')).toThrow();
        expect(() => decoder(NaN)).toThrow();
        expect(() => decoder(1 / 0)).toThrow();
    });
});

describe('decodes hardcoded values', () => {
    const fourtyTwoDecoder = decodeValue(42);

    it('simply returns 42 for any input', () => {
        expect(fourtyTwoDecoder('')).toBe(42);
        expect(fourtyTwoDecoder('foo')).toBe(42);
        expect(fourtyTwoDecoder(undefined)).toBe(42);
        expect(fourtyTwoDecoder([1, 2, 3])).toBe(42);
        expect(fourtyTwoDecoder()).toBe(42);
    });
});
