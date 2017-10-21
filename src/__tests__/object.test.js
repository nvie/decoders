// @flow

import { number } from '../number';
import { object } from '../object';
import { optional } from '../optional';
import { string } from '../string';

describe('objects and fields', () => {
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
});
