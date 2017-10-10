// @flow

import { decodeMap } from '../map';
import { decodeObject } from '../object';
import { decodeString } from '../string';

describe('mappings', () => {
    it('decodes json mappings (lookup tables)', () => {
        const input = JSON.parse('{ "18": { "name": "foo" }, "23": { "name": "bar" }, "key": { "name": "value" } }');
        const dec = decodeMap(
            decodeObject({
                name: decodeString(),
            })
        );
        const output = new Map([['18', { name: 'foo' }], ['23', { name: 'bar' }], ['key', { name: 'value' }]]);
        expect(dec(input)).toEqual(output);

        expect(() => dec({ foo: 1, bar: 2 })).toThrow();
    });
});
