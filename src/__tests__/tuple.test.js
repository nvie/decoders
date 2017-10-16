// @flow

import { decodeNumber } from '../number';
import { optional } from '../optional';
import { decodeString } from '../string';
import { decodeTuple2 } from '../tuple';

describe('tuples', () => {
    it('composes 2-tuples of decoders', () => {
        const dec = decodeTuple2(decodeString(), decodeNumber());
        expect(dec(['foo', 42])).toEqual(['foo', 42]);
        expect(() => dec(['foo', 'bar'])).toThrow();
        expect(() => dec([42, 'foo'])).toThrow();
        expect(() => dec([42, 1.3])).toThrow();
        expect(() => dec([42, 'foo', true])).toThrow();
        expect(() => dec([])).toThrow();
    });

    it('composes optional decoders', () => {
        // First, show that "normal" decodeNumber does not accept undefined const dec = decodeNumber(); expect(dec(123)).toEqual(123); expect(() => dec(undefined)).toThrow(); // But wrapping it in an optional will allow just that const opt = optional(dec); expect(opt(123)).toEqual(123); expect(opt(undefined)).toBeUndefined(); }); it('composes optional decoders that also allow null values', () => {
        // First, show that "normal" usage of optional() does not accept nulls
        const dec1 = optional(decodeNumber());
        expect(dec1(123)).toEqual(123);
        // TODO: expect(dec1(undefined)).toBeUndefined();
        expect(() => dec1(null)).toThrow();

        const dec2 = optional(decodeNumber(), /* allowNull = */ true);
        expect(dec2(123)).toEqual(123);
        // TODO: expect(dec2(undefined)).toBeUndefined();
        // TODO: expect(dec2(null)).toBeUndefined(); // However won't return null but undefined!
    });
});
