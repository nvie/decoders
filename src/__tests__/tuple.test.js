// @flow

import { number } from '../number';
import { string } from '../string';
import { tuple2 } from '../tuple';

describe('tuples', () => {
    it('tuple2', () => {
        const verifier = tuple2(string, number);
        expect(verifier(['foo', 42]).unwrap()).toEqual(['foo', 42]);
        expect(verifier([42, 'foo']).isErr()).toBe(true);
        expect(verifier([42, 'foo', true]).isErr()).toBe(true);
    });
});
