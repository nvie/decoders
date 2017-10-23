// @flow

import { mapping } from '../mapping';
import { object } from '../object';
import { string } from '../string';

describe('mappings', () => {
    const verifier = mapping(object({ name: string }));

    it('valid', () => {
        const input = { '18': { name: 'foo' }, '23': { name: 'bar' }, key: { name: 'value' } };
        const output = new Map([['18', { name: 'foo' }], ['23', { name: 'bar' }], ['key', { name: 'value' }]]);
        expect(verifier(input).unwrap()).toEqual(output);
    });

    it('invalid', () => {
        expect(() => verifier('foo').unwrap()).toThrow('Must be an object');
        expect(() => verifier({ foo: 1 }).unwrap()).toThrow('Unexpected value');
    });
});
