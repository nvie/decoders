// @flow strict

import { guard } from '../guard';
import { dict, mapping } from '../mapping';
import { object } from '../object';
import { string } from '../string';

describe('mappings', () => {
    const decoder = mapping(object({ name: string }));

    it('valid', () => {
        const input = {
            // prettier-ignore
            '18': { name: 'foo' },
            // prettier-ignore
            '23': { name: 'bar' },
            key: { name: 'value' },
        };
        const output = new Map([
            ['18', { name: 'foo' }],
            ['23', { name: 'bar' }],
            ['key', { name: 'value' }],
        ]);
        expect(decoder(input).unwrap()).toEqual(output);
    });

    it('invalid', () => {
        expect(() => guard(decoder)('foo')).toThrow('Must be an object');
        expect(() => guard(decoder)({ foo: 1 })).toThrow('Must be an object');
        expect(() => guard(decoder)({ foo: {} })).toThrow('Missing key: "name"');
        expect(() =>
            guard(decoder)({
                // prettier-ignore
                '124': { invalid: true },
                // prettier-ignore
                '125': { name: 'bar' },
            }),
        ).toThrow('Missing key: "name"');
    });
});

describe('dicts', () => {
    const decoder = dict(object({ name: string }));

    it('valid', () => {
        const input = {
            // prettier-ignore
            '18': { name: 'foo' },
            // prettier-ignore
            '23': { name: 'bar' },
            key: { name: 'value' },
        };
        expect(decoder(input).unwrap()).toEqual(input);
    });

    it('invalid', () => {
        expect(() => guard(decoder)('foo')).toThrow('Must be an object');
        expect(() => guard(decoder)({ foo: 1 })).toThrow('Must be an object');
        expect(() => guard(decoder)({ foo: {} })).toThrow('Missing key: "name"');
        expect(() =>
            guard(decoder)({
                // prettier-ignore
                '124': { invalid: true },
                // prettier-ignore
                '125': { name: 'bar' },
            }),
        ).toThrow('Missing key: "name"');
    });
});
