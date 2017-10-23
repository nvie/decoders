// @flow

import { number } from '../number';
import { field, object } from '../object';
import { optional } from '../optional';
import { string } from '../string';

describe('objects', () => {
    it('decodes objects and fields', () => {
        const verifier = object({
            id: number,
            name: string,
        });

        expect(verifier({ id: 1, name: 'test' }).unwrap()).toEqual({ id: 1, name: 'test' });

        // Superfluous keys are just ignored
        expect(verifier({ id: 1, name: 'test', superfluous: 'abundance' }).unwrap()).toEqual({ id: 1, name: 'test' });
    });

    it('decodes objects and fields (ignore fields)', () => {
        // Extra (unwanted) keys are ignored
        const verifier = object({
            id: number,
            name: string,
            extra: optional(string),
        });

        expect(verifier({ id: 1, name: 'test' }).unwrap()).toEqual({ id: 1, name: 'test', extra: undefined });
        expect(verifier({ id: 1, name: 'test', extra: 'foo' }).unwrap()).toEqual({ id: 1, name: 'test', extra: 'foo' });
        expect(verifier({}).isErr()).toBe(true); // missing keys 'id' and 'name'
    });

    it('decodes objects and fields (ignore fields)', () => {
        const verifier = object({ id: string });

        expect(verifier('foo').isErr()).toBe(true);
        expect(verifier(3.14).isErr()).toBe(true);
        expect(verifier([]).isErr()).toBe(true);
        expect(verifier(undefined).isErr()).toBe(true);
        expect(verifier(NaN).isErr()).toBe(true);
    });
});

describe('fields', () => {
    const verifier = field('type', string);

    it('valid', () => {
        expect(verifier({ type: 'foo' }).unwrap()).toEqual('foo');
    });

    it('invalid', () => {
        expect(() => verifier('foo').unwrap()).toThrow('Must be an object');
        expect(() => verifier({}).unwrap()).toThrow('Missing field "type"');
        expect(() => verifier({ type: 42 }).unwrap()).toThrow('Unexpected value for field "type"');
    });
});
