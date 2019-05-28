// @flow strict

import { guard } from '../guard';
import { number } from '../number';
import { exact, object, pojo } from '../object';
import { optional } from '../optional';
import { string } from '../string';

describe('objects', () => {
    it('decodes objects and fields', () => {
        const decoder = object({
            id: number,
            name: string,
        });

        expect(decoder({ id: 1, name: 'test' }).unwrap()).toEqual({ id: 1, name: 'test' });

        // Superfluous keys are just ignored
        expect(decoder({ id: 1, name: 'test', superfluous: 'abundance' }).unwrap()).toEqual({ id: 1, name: 'test' });
    });

    it('decodes objects and fields (ignore superfluous fields)', () => {
        // Extra (unwanted) keys are ignored
        const decoder = object({
            id: number,
            name: string,
            extra: optional(string),
        });

        expect(decoder({ id: 1, name: 'test' }).unwrap()).toEqual({ id: 1, name: 'test', extra: undefined });
        expect(decoder({ id: 1, name: 'test', extra: 'foo' }).unwrap()).toEqual({ id: 1, name: 'test', extra: 'foo' });
    });

    it('reports all errors at once', () => {
        const decoder = guard(
            object({
                id: number,
                name: string,
                extra: optional(string),
            })
        );

        // All good (no missing/decoding errors)
        expect(() => decoder({ id: 1, name: 'valid' })).not.toThrow('Must be string');
        expect(() => decoder({ id: 1, name: 'valid' })).not.toThrow('Missing key');
        expect(() => decoder({ id: 1, name: 'valid', extra: undefined })).not.toThrow('Must be string');
        expect(() => decoder({ id: 1, name: 'valid', extra: undefined })).not.toThrow('Missing key');

        // Test missing key errors
        expect(() => decoder({ name: 'valid' })).toThrow('Missing key: "id"');
        expect(() => decoder({ name: 'valid' })).not.toThrow('Must be string');
        expect(() => decoder({ name: 'valid', extra: undefined })).toThrow('Missing key: "id"');
        expect(() => decoder({ name: 'valid', extra: undefined })).not.toThrow('Must be string');
        expect(() => decoder({ extra: 'valid' })).toThrow('Missing keys: "id", "name"');
        expect(() => decoder({ extra: 'valid' })).not.toThrow('Must be string');
        expect(() => decoder({ name: undefined, extra: 'valid' })).toThrow('Missing keys: "id", "name"');
        expect(() => decoder({ name: undefined, extra: 'valid' })).not.toThrow('Must be string');

        // Now test that both errors are part of the same error!
        expect(() => decoder({ name: 42 })).toThrow('Must be string');
        expect(() => decoder({ name: 42 })).toThrow('Missing key: "id"');

        // Both of these messages are part of the same error!
        expect(() => decoder({ extra: 42 })).toThrow('Must be string');
    });

    it('errors on non-objects', () => {
        const decoder = object({ id: string });

        expect(decoder('foo').isErr()).toBe(true);
        expect(decoder(3.14).isErr()).toBe(true);
        expect(decoder([]).isErr()).toBe(true);
        expect(decoder(undefined).isErr()).toBe(true);
        expect(decoder(NaN).isErr()).toBe(true);
        expect(decoder({ foo: [1, 2, 3] }).isErr()).toBe(true); // Missing key "id"
        expect(decoder({ id: 3 }).isErr()).toBe(true); // Invalid field value for "id"
    });
});

describe('exact objects', () => {
    it('decodes objects and fields', () => {
        const decoder = exact({ id: number, name: string });
        expect(decoder({ id: 1, name: 'test' }).unwrap()).toEqual({ id: 1, name: 'test' });
    });

    it('fails on superfluous keys', () => {
        const decoder = exact({ id: number, name: string });
        expect(() => guard(decoder)({ id: 1, name: 'test', superfluous: 'abundance' })).toThrow('Superfluous keys');
    });

    it('errors on non-objects', () => {
        const decoder = exact({ id: string });

        expect(decoder('foo').isErr()).toBe(true);
        expect(decoder(3.14).isErr()).toBe(true);
        expect(decoder([]).isErr()).toBe(true);
        expect(decoder(undefined).isErr()).toBe(true);
        expect(decoder(NaN).isErr()).toBe(true);
        expect(decoder({ foo: [1, 2, 3] }).isErr()).toBe(true); // Missing key "id"
        expect(decoder({ id: 3 }).isErr()).toBe(true); // Invalid field value for "id"
    });
});

describe('pojo', () => {
    it('decodes objects and fields', () => {
        const decoder = guard(pojo);
        expect(decoder({})).toEqual({});
        expect(decoder({ a: 1 })).toEqual({ a: 1 });

        // Not
        expect(() => decoder(null)).toThrow();
        expect(() => decoder(42)).toThrow();
    });
});

describe('arrays are not objects', () => {
    const decoder1 = object({});
    const decoder2 = object({
        opt: optional(string),
    });

    it('valid', () => {
        expect(guard(decoder1)({ what: 'ever' })).toEqual({});
        expect(guard(decoder2)({ what: 'ever' })).toEqual({});
    });

    it('invalid', () => {
        expect(() => guard(decoder1)([])).toThrow('Must be an object');
        expect(() => guard(decoder2)([])).toThrow('Must be an object');
        expect(() => guard(decoder1)('an string')).toThrow('Must be an object');
        expect(() => guard(decoder2)('an string')).toThrow('Must be an object');
        expect(() => guard(decoder1)(new String())).toThrow('Must be an object');
        expect(() => guard(decoder2)(new String())).toThrow('Must be an object');
        expect(() => guard(decoder1)(new Date())).toThrow('Must be an object');
        expect(() => guard(decoder2)(new Date())).toThrow('Must be an object');
    });
});
