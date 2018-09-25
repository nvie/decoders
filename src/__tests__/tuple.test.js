// @flow strict

import { number } from '../number';
import { string } from '../string';
import { tuple2 } from '../tuple';

describe('tuples', () => {
    it('tuple2', () => {
        const decoder = tuple2(string, number);
        expect(decoder(['foo', 42]).unwrap()).toEqual(['foo', 42]);
        expect(decoder(['foo', 'bar']).isErr()).toBe(true);
        expect(decoder([42, 'foo']).isErr()).toBe(true);
        expect(decoder([42, 13]).isErr()).toBe(true);

        // Invalid
        expect(decoder('not an array').isErr()).toBe(true);
        expect(decoder(undefined).isErr()).toBe(true);

        // Wrong arity (not a 2-tuple)
        expect(decoder([]).isErr()).toBe(true);
        expect(decoder(['foo']).isErr()).toBe(true);
        expect(decoder(['foo', 42, true]).isErr()).toBe(true);
    });
});
