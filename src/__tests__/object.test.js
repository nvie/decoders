// @flow

import { guard } from '../guard';
import { number } from '../number';
import { field, object, pojo } from '../object';
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
        expect(decoder({}).isErr()).toBe(true); // missing keys 'id' and 'name'
    });

    it('errors on non-objects', () => {
        const decoder = object({ id: string });

        expect(decoder('foo').isErr()).toBe(true);
        expect(decoder(3.14).isErr()).toBe(true);
        expect(decoder([]).isErr()).toBe(true);
        expect(decoder(undefined).isErr()).toBe(true);
        expect(decoder(NaN).isErr()).toBe(true);
        expect(decoder({ foo: [1, 2, 3] }).isErr()).toBe(true); // Missing field "id"
        expect(decoder({ id: 3 }).isErr()).toBe(true); // Invalid field value for "id"
    });
});

describe('pojo', () => {
    it('decodes objects and fields', () => {
        const decoder = guard(pojo);
        expect(decoder({})).toEqual({});
        expect(decoder({ a: 1 })).toEqual({ a: 1 });
        expect(decoder(new String())).toEqual(new String());

        // Not
        expect(() => decoder(null)).toThrow();
        expect(() => decoder(42)).toThrow();
    });
});

describe('fields', () => {
    const decoder = field('type', string);

    it('valid', () => {
        expect(decoder({ type: 'foo' }).unwrap()).toEqual('foo');
    });

    it('invalid', () => {
        expect(() => guard(decoder)('foo')).toThrow('Must be an object');
        expect(() => guard(decoder)({})).toThrow('Missing field "type"');
        expect(() => guard(decoder)({ type: 42 })).toThrow('Unexpected value for field "type"');
        expect(() => guard(decoder)({ type: null })).toThrow('Unexpected value for field "type"');
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
        expect(() => guard(decoder1)(new Date())).toThrow('Must be an object');
        expect(() => guard(decoder2)(new Date())).toThrow('Must be an object');
    });
});
