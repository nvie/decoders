// @flow

import { number } from '../number';
import { string } from '../string';
import { tuple2 } from '../tuple';

describe('tuples', () => {
    it('tuple2', () => {
        const verifier = tuple2(string, number);
        expect(verifier(['foo', 42]).unwrap()).toEqual(['foo', 42]);
        expect(verifier(['foo', 'bar']).isErr()).toBe(true);
        expect(verifier([42, 'foo']).isErr()).toBe(true);

        // Invalid
        expect(verifier('not an array').isErr()).toBe(true);
        expect(verifier(undefined).isErr()).toBe(true);

        // Wrong arity (not a 2-tuple)
        expect(verifier([]).isErr()).toBe(true);
        expect(verifier(['foo']).isErr()).toBe(true);
        expect(verifier(['foo', 42, true]).isErr()).toBe(true);
    });
});
