// @flow

import { decodeConstant, decodeNull, decodeUndefined, decodeValue } from '../constants';

describe('decodes constant from JSON', () => {
    it('decode the null constant (just like decodeNull)', () => {
        const decoder = decodeConstant(null);
        expect(decoder(null)).toBeNull();
        expect(() => decoder(1)).toThrow();
        expect(() => decoder(true)).toThrow();
        expect(() => decoder(undefined)).toThrow();
        expect(() => decoder('foo')).toThrow();
        expect(() => decoder(NaN)).toThrow();
        expect(() => decoder(1 / 0)).toThrow();
    });

    it('decode string constants', () => {
        const decoder = decodeConstant('foo');
        expect(decoder('foo')).toEqual('foo');
        expect(() => decoder(1)).toThrow();
        expect(() => decoder(true)).toThrow();
        expect(() => decoder(undefined)).toThrow();
        expect(() => decoder('bar')).toThrow();
        expect(() => decoder(NaN)).toThrow();
        expect(() => decoder(1 / 0)).toThrow();
    });

    it('decode number constants', () => {
        const decoder = decodeConstant(42);
        expect(decoder(42)).toEqual(42);
        expect(() => decoder(1)).toThrow();
        expect(() => decoder(true)).toThrow();
        expect(() => decoder(undefined)).toThrow();
        expect(() => decoder('bar')).toThrow();
        expect(() => decoder(NaN)).toThrow();
        expect(() => decoder(1 / 0)).toThrow();
    });

    it('decode boolean constants', () => {
        const decoder = decodeConstant(false);
        expect(decoder(false)).toEqual(false);
        expect(() => decoder(1)).toThrow();
        expect(() => decoder(true)).toThrow();
        expect(() => decoder(undefined)).toThrow();
        expect(() => decoder('bar')).toThrow();
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
