// @flow strict

import * as Result from '../Result';
import { exact, inexact, object, pojo } from '../object';
import { guard } from '../guard';
import { hardcoded } from '../constants';
import { number } from '../number';
import { optional } from '../optional';
import { string } from '../string';

describe('objects', () => {
    it('decodes objects and fields', () => {
        const decoder = object({
            id: number,
            name: string,
        });

        expect(Result.unwrap(decoder({ id: 1, name: 'test' }))).toEqual({
            id: 1,
            name: 'test',
        });

        // Superfluous keys are just ignored
        expect(
            Result.unwrap(decoder({ id: 1, name: 'test', superfluous: 'abundance' })),
        ).toEqual({ id: 1, name: 'test' });
    });

    it('decodes objects and fields (ignore superfluous fields)', () => {
        // Extra (unwanted) keys are ignored
        const decoder = object({
            id: number,
            name: string,
            extra: optional(string),
        });

        expect(Result.unwrap(decoder({ id: 1, name: 'test' }))).toEqual({
            id: 1,
            name: 'test',
        });
        expect(Result.unwrap(decoder({ id: 1, name: 'test', extra: 'foo' }))).toEqual({
            id: 1,
            name: 'test',
            extra: 'foo',
        });
    });

    it('objects with optional fields will be implicit-undefined', () => {
        const defaults = {
            extra: 'default',
        };

        const decoder = object({
            id: number,
            name: string,
            extra: optional(string),
        });

        expect({
            ...defaults,
            ...Result.unwrap(decoder({ id: 1, name: 'test' })),
        }).toEqual({
            id: 1,
            name: 'test',
            extra: 'default',
        });
    });

    it('reports all errors at once', () => {
        const decoder = guard(
            object({
                id: number,
                name: string,
                extra: optional(string),
            }),
        );

        // All good (no missing/decoding errors)
        expect(() => decoder({ id: 1, name: 'valid' })).not.toThrow('Must be string');
        expect(() => decoder({ id: 1, name: 'valid' })).not.toThrow('Missing key');
        expect(() => decoder({ id: 1, name: 'valid', extra: undefined })).not.toThrow(
            'Must be string',
        );
        expect(() => decoder({ id: 1, name: 'valid', extra: undefined })).not.toThrow(
            'Missing key',
        );

        // Test missing key errors
        expect(() => decoder({ name: 'valid' })).toThrow('Missing key: "id"');
        expect(() => decoder({ name: 'valid' })).not.toThrow('Must be string');
        expect(() => decoder({ name: 'valid', extra: undefined })).toThrow(
            'Missing key: "id"',
        );
        expect(() => decoder({ name: 'valid', extra: undefined })).not.toThrow(
            'Must be string',
        );
        expect(() => decoder({ extra: 'valid' })).toThrow('Missing keys: "id", "name"');
        expect(() => decoder({ extra: 'valid' })).not.toThrow('Must be string');
        expect(() => decoder({ name: undefined, extra: 'valid' })).toThrow(
            'Missing keys: "id", "name"',
        );
        expect(() => decoder({ name: undefined, extra: 'valid' })).not.toThrow(
            'Must be string',
        );

        // Now test that both errors are part of the same error!
        expect(() => decoder({ name: 42 })).toThrow('Must be string');
        expect(() => decoder({ name: 42 })).toThrow('Missing key: "id"');

        // Both of these messages are part of the same error!
        expect(() => decoder({ extra: 42 })).toThrow('Must be string');
    });

    it('errors on non-objects', () => {
        const decoder = object({ id: string });

        expect(Result.isErr(decoder('foo'))).toBe(true);
        expect(Result.isErr(decoder(3.14))).toBe(true);
        expect(Result.isErr(decoder([]))).toBe(true);
        expect(Result.isErr(decoder(undefined))).toBe(true);
        expect(Result.isErr(decoder(NaN))).toBe(true);
        expect(Result.isErr(decoder({ foo: [1, 2, 3] }))).toBe(true); // Missing key "id"
        expect(Result.isErr(decoder({ id: 3 }))).toBe(true); // Invalid field value for "id"
    });
});

describe('exact objects', () => {
    it('decodes objects and fields', () => {
        const decoder = exact({ id: number, name: string });
        expect(Result.unwrap(decoder({ id: 1, name: 'test' }))).toEqual({
            id: 1,
            name: 'test',
        });
    });

    it('fails on superfluous keys', () => {
        const decoder = exact({ id: number, name: string });
        expect(() =>
            guard(decoder)({ id: 1, name: 'test', superfluous: 'abundance' }),
        ).toThrow('Superfluous keys');
    });

    it('retains extra hardcoded fields', () => {
        const decoder = exact({
            id: number,
            name: string,
            extra: hardcoded('extra'),
        });
        expect(Result.unwrap(decoder({ id: 1, name: 'test' }))).toEqual({
            id: 1,
            name: 'test',
            extra: 'extra',
        });
        expect(Result.unwrap(decoder({ id: 1, name: 'test', extra: 42 }))).toEqual({
            id: 1,
            name: 'test',
            extra: 'extra',
        });
        expect(() =>
            guard(decoder)({ id: 1, name: 'test', superfluous: 'abundance' }),
        ).toThrow('Superfluous keys');
        expect(() =>
            guard(decoder)({ id: 1, name: 'test', extra: 42, superfluous: 'abundance' }),
        ).toThrow('Superfluous keys');
    });

    it('errors on non-objects', () => {
        const decoder = exact({ id: string });

        expect(Result.isErr(decoder('foo'))).toBe(true);
        expect(Result.isErr(decoder(3.14))).toBe(true);
        expect(Result.isErr(decoder([]))).toBe(true);
        expect(Result.isErr(decoder(undefined))).toBe(true);
        expect(Result.isErr(decoder(NaN))).toBe(true);
        expect(Result.isErr(decoder({ foo: [1, 2, 3] }))).toBe(true); // Missing key "id"
        expect(Result.isErr(decoder({ id: 3 }))).toBe(true); // Invalid field value for "id"
    });

    it('exact objects with optional fields will be implicit-undefined', () => {
        const defaults = {
            extra: 'default',
        };

        const decoder = exact({
            id: number,
            name: string,
            extra: optional(string),
        });

        expect({
            ...defaults,
            ...Result.unwrap(decoder({ id: 1, name: 'test' })),
        }).toEqual({
            id: 1,
            name: 'test',
            extra: 'default',
        });
    });
});

describe('inexact objects', () => {
    it('decodes objects and fields', () => {
        const decoder = inexact({ id: number, name: string });
        expect(Result.unwrap(decoder({ id: 1, name: 'test' }))).toEqual({
            id: 1,
            name: 'test',
        });

        // Extra properties will be retained, but "unknown"
        expect(
            Result.unwrap(decoder({ id: 1, name: 'test', extra1: 123, extra2: 'hey' })),
        ).toEqual({
            id: 1,
            name: 'test',
            extra1: 123,
            extra2: 'hey',
        });
    });

    it('retains extra hardcoded fields', () => {
        const decoder = inexact({ id: number, name: string, extra: hardcoded('extra') });
        expect(Result.unwrap(decoder({ id: 1, name: 'test', extra: 42 }))).toEqual({
            id: 1,
            name: 'test',
            extra: 'extra',
        });
        expect(Result.unwrap(decoder({ id: 1, name: 'test' }))).toEqual({
            id: 1,
            name: 'test',
            extra: 'extra',
        });

        // Extra properties will be retained, but "unknown"
        expect(
            Result.unwrap(decoder({ id: 1, name: 'test', extra1: 123, extra2: 'hey' })),
        ).toEqual({
            id: 1,
            name: 'test',
            extra: 'extra',
            extra1: 123,
            extra2: 'hey',
        });
    });

    it('errors on non-objects', () => {
        const decoder = inexact({ id: string });

        expect(Result.isErr(decoder('foo'))).toBe(true);
        expect(Result.isErr(decoder(3.14))).toBe(true);
        expect(Result.isErr(decoder([]))).toBe(true);
        expect(Result.isErr(decoder(undefined))).toBe(true);
        expect(Result.isErr(decoder(NaN))).toBe(true);
        expect(Result.isErr(decoder({ foo: [1, 2, 3] }))).toBe(true); // Missing key "id"
        expect(Result.isErr(decoder({ id: 3 }))).toBe(true); // Invalid field value for "id"
    });

    it('inexact objects with optional fields will be implicit-undefined', () => {
        const defaults = {
            foo: 'default',
            bar: 'default',
        };

        const decoder = inexact({
            foo: optional(string),
        });

        expect(
            //
            // NOTE: We'll have to prettier-ignore this line, because the
            // suppression location of this [cannot-spread-indexer] error has
            // moved between Flow versions we want to support. By putting this
            // expression on a single line, we avoid CI from failing when
            // running Flow checks between old and new versions ;)
            //
            // prettier-ignore
            // $FlowFixMe[cannot-spread-indexer]
            { ...defaults, ...Result.unwrap(decoder({ foo: undefined, bar: undefined })) },
        ).toEqual({
            foo: 'default', // 'foo' is known and allowed-optional, so this will be implicit-undefined
            bar: undefined, // 'bar' is ignored so the explicit-undefined will override here
        });
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

    it('invalid (basic types)', () => {
        expect(() => guard(decoder1)([])).toThrow('Must be an object');
        expect(() => guard(decoder2)([])).toThrow('Must be an object');
        expect(() => guard(decoder1)('an string')).toThrow('Must be an object');
        expect(() => guard(decoder2)('an string')).toThrow('Must be an object');
    });

    it('invalid (custom classes)', () => {
        expect(() => guard(decoder1)(new String())).toThrow('Must be an object');
        expect(() => guard(decoder2)(new String())).toThrow('Must be an object');
        expect(() => guard(decoder1)(new Error('foo'))).toThrow('Must be an object');
        expect(() => guard(decoder2)(new Error('foo'))).toThrow('Must be an object');
        expect(() => guard(decoder1)(new Date())).toThrow('Must be an object');
        expect(() => guard(decoder2)(new Date())).toThrow('Must be an object');
    });
});
