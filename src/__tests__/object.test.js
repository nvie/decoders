// @flow

import { number } from '../number';
import { field, object } from '../object';
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

    it('decodes objects and fields (ignore fields)', () => {
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

    it('decodes objects and fields (ignore fields)', () => {
        const decoder = object({ id: string });

        expect(decoder('foo').isErr()).toBe(true);
        expect(decoder(3.14).isErr()).toBe(true);
        expect(decoder([]).isErr()).toBe(true);
        expect(decoder(undefined).isErr()).toBe(true);
        expect(decoder(NaN).isErr()).toBe(true);
        expect(decoder({ foo: [1, 2, 3] }).isErr()).toBe(true);
    });
});

describe('fields', () => {
    const decoder = field('type', string);

    it('valid', () => {
        expect(decoder({ type: 'foo' }).unwrap()).toEqual('foo');
    });

    it('invalid', () => {
        expect(() => decoder('foo').unwrap()).toThrow('Must be an object');
        expect(() => decoder({}).unwrap()).toThrow('Missing field "type"');
        expect(() => decoder({ type: 42 }).unwrap()).toThrow('Unexpected value for field "type"');
    });
});
