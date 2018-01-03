// @flow

import { mapping } from '../mapping';
import { object } from '../object';
import { guard } from '../guard';
import { string } from '../string';

describe('mappings', () => {
    const decoder = mapping(object({ name: string }));

    it('valid', () => {
        const input = { '18': { name: 'foo' }, '23': { name: 'bar' }, key: { name: 'value' } };
        const output = new Map([['18', { name: 'foo' }], ['23', { name: 'bar' }], ['key', { name: 'value' }]]);
        expect(decoder(input).unwrap()).toEqual(output);
    });

    it('invalid', () => {
        expect(() => guard(decoder)('foo')).toThrow('Must be an object');
        expect(() => guard(decoder)({ foo: 1 })).toThrow('Unexpected value');
        expect(() =>
            guard(decoder)({
                '124': { invalid: true },
                '125': { name: 'bar' },
            })
        ).toThrow('Unexpected value');
    });
});
