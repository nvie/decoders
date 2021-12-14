// @flow strict

import { dict, mapping } from '../mapping';
import { guard } from '../../_guard';
import { object } from '../object';
import { string } from '../string';
import { unwrap } from '../../result';

describe('mappings', () => {
    const decoder = mapping(object({ name: string }));

    it('valid', () => {
        const input = {
            '18': { name: 'foo' },
            '23': { name: 'bar' },
            key: { name: 'value' },
        };
        const output = new Map([
            ['18', { name: 'foo' }],
            ['23', { name: 'bar' }],
            ['key', { name: 'value' }],
        ]);
        expect(unwrap(decoder(input))).toEqual(output);
    });

    it('invalid', () => {
        expect(() => guard(decoder)('foo')).toThrow('Must be an object');
        expect(() => guard(decoder)({ foo: 1 })).toThrow('Must be an object');
        expect(() => guard(decoder)({ foo: {} })).toThrow('Missing key: "name"');
        expect(() =>
            guard(decoder)({
                '124': { invalid: true },
                '125': { name: 'bar' },
            }),
        ).toThrow('Missing key: "name"');

        // More than one error
        expect(() => guard(decoder)({ foo: 42, bar: 42 })).toThrow();
    });
});

describe('dicts', () => {
    const decoder = dict(object({ name: string }));

    it('valid', () => {
        const input = {
            '18': { name: 'foo' },
            '23': { name: 'bar' },
            key: { name: 'value' },
        };
        expect(unwrap(decoder(input))).toEqual(input);
    });

    it('invalid', () => {
        expect(() => guard(decoder)('foo')).toThrow('Must be an object');
        expect(() => guard(decoder)({ foo: 1 })).toThrow('Must be an object');
        expect(() => guard(decoder)({ foo: {} })).toThrow('Missing key: "name"');
        expect(() =>
            guard(decoder)({
                '124': { invalid: true },
                '125': { name: 'bar' },
            }),
        ).toThrow('Missing key: "name"');
    });
});
