// @flow

import { describe, it, expect } from 'jest';
import { decodeArray, decodeMap, decodeObject, decodeTuple2, nullable, oneOf, optional } from '../compositions';
import { decodeNumber, decodeString } from '../primitives';

describe('compose decoders to form complex decoders', () => {
    it('composes array-of decoders', () => {
        const dec = decodeArray(decodeString());
        expect(dec([])).toEqual([]);
        expect(dec(['foo', 'bar'])).toEqual(['foo', 'bar']);
    });

    it('composes nested array-of decoders', () => {
        const dec = decodeArray(decodeArray(decodeNumber()));
        expect(dec([])).toEqual([]);
        expect(dec([[]])).toEqual([[]]);
        expect(dec([[1, 2], [], [3, 4, 5]])).toEqual([[1, 2], [], [3, 4, 5]]);
    });

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
        // First, show that "normal" decodeNumber does not accept undefined
        const dec = decodeNumber();
        expect(dec(123)).toEqual(123);
        expect(() => dec(undefined)).toThrow();

        // But wrapping it in an optional will allow just that
        const opt = optional(dec);
        expect(opt(123)).toEqual(123);
        expect(opt(undefined)).toBeUndefined();
    });

    it('composes optional decoders that also allow null values', () => {
        // First, show that "normal" usage of optional() does not accept nulls
        const dec1 = optional(decodeNumber());
        expect(dec1(123)).toEqual(123);
        expect(dec1(undefined)).toBeUndefined();
        expect(() => dec1(null)).toThrow();

        const dec2 = optional(decodeNumber(), /* allowNull = */ true);
        expect(dec2(123)).toEqual(123);
        expect(dec2(undefined)).toBeUndefined();
        expect(dec2(null)).toBeUndefined(); // However won't return null but undefined!
    });

    it('composes nullable decoders', () => {
        // First, show that "normal" decodeNumber does not accept undefined
        const dec = decodeNumber();
        expect(dec(123)).toEqual(123);
        expect(() => dec(null)).toThrow();
        expect(() => dec(undefined)).toThrow();

        // But wrapping it in an optional will allow just that
        const opt = nullable(dec);
        expect(opt(123)).toEqual(123);
        expect(opt(null)).toBeNull();
        expect(() => dec(undefined)).toThrow();
    });

    it('decodes objects and fields', () => {
        const dec = decodeObject({
            id: decodeNumber(),
            name: decodeString(),
        });
        expect(dec({ id: 1, name: 'test' })).toEqual({ id: 1, name: 'test' });
        // Superfluous keys are just ignored
        expect(dec({ id: 1, name: 'test', superfluous: 'abundance' })).toEqual({ id: 1, name: 'test' });
    });

    it('decodes objects and fields (ignore fields)', () => {
        // Extra (unwanted) keys are ignored
        const dec = decodeObject({
            id: decodeNumber(),
            name: decodeString(),
            extra: optional(decodeString()),
        });
        expect(dec({ id: 1, name: 'test' })).toEqual({ id: 1, name: 'test', extra: undefined });
        expect(dec({ id: 1, name: 'test', extra: 'foo' })).toEqual({ id: 1, name: 'test', extra: 'foo' });
        expect(() => dec({})).toThrow(); // missing keys 'id' and 'name'
    });

    it('decodes json mappings (lookup tables)', () => {
        const input = JSON.parse('{ "18": { "name": "foo" }, "23": { "name": "bar" }, "key": { "name": "value" } }');
        const dec = decodeMap(
            decodeObject({
                name: decodeString(),
            })
        );
        const output = new Map([['18', { name: 'foo' }], ['23', { name: 'bar' }], ['key', { name: 'value' }]]);
        expect(dec(input)).toEqual(output);

        expect(() => dec({ foo: 1, bar: 2 })).toThrow();
    });

    it('decodes union types', () => {
        const dec = oneOf(decodeString(), decodeNumber());
        expect(dec('ohai')).toEqual('ohai');
        expect(dec(1)).toEqual(1);
        expect(() => dec({ id: 1, name: 'test' })).toThrow();
        expect(() => dec(['ohai'])).toThrow();
        expect(() => dec(null)).toThrow();
    });
});
