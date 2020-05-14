// @flow strict

import { number } from '../number';
import { string } from '../string';
import { tuple1, tuple2, tuple3, tuple4, tuple5, tuple6 } from '../tuple';

describe('tuples', () => {
    it('tuple1', () => {
        const decoder = tuple1(string);
        expect(decoder(['foo']).unwrap()).toEqual(['foo']);
        expect(decoder(['foo', 'bar']).isErr()).toBe(true);
        expect(decoder([42]).isErr()).toBe(true);
        expect(decoder([42, 13]).isErr()).toBe(true);

        // Invalid
        expect(decoder('not an array').isErr()).toBe(true);
        expect(decoder(undefined).isErr()).toBe(true);

        // Wrong arity (not a 1-tuple)
        expect(decoder([]).isErr()).toBe(true);
        expect(decoder(['foo', 42, true]).isErr()).toBe(true);
    });

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

    it('tuple3', () => {
        const decoder = tuple3(number, number, number);
        expect(decoder([1, 2, 3]).isOk()).toBe(true);
        expect(decoder([]).isErr()).toBe(true);
        expect(decoder([1]).isErr()).toBe(true);
        expect(decoder([1, 2]).isErr()).toBe(true);
        expect(decoder([1, 2, 'foo']).isErr()).toBe(true);
        expect(decoder([1, 'foo', 2]).isErr()).toBe(true);
        expect(decoder(['foo', 1, 2]).isErr()).toBe(true);
    });

    it('tuple4', () => {
        const decoder = tuple4(number, number, number, number);
        expect(decoder([1, 2, 3, 4]).isOk()).toBe(true);
        expect(decoder([]).isErr()).toBe(true);
        expect(decoder([1]).isErr()).toBe(true);
        expect(decoder([1, 2]).isErr()).toBe(true);
        expect(decoder([1, 2, 3]).isErr()).toBe(true);
        expect(decoder([1, 2, 3, 'foo']).isErr()).toBe(true);
        expect(decoder([1, 2, 'foo', 3]).isErr()).toBe(true);
        expect(decoder([1, 'foo', 2, 3]).isErr()).toBe(true);
        expect(decoder(['foo', 1, 2, 3]).isErr()).toBe(true);
    });

    it('tuple5', () => {
        const decoder = tuple5(number, number, number, number, number);
        expect(decoder([1, 2, 3, 4, 5]).isOk()).toBe(true);
        expect(decoder([]).isErr()).toBe(true);
        expect(decoder([1]).isErr()).toBe(true);
        expect(decoder([1, 2]).isErr()).toBe(true);
        expect(decoder([1, 2, 3]).isErr()).toBe(true);
        expect(decoder([1, 2, 3, 4]).isErr()).toBe(true);
        expect(decoder([1, 2, 3, 4, 'foo']).isErr()).toBe(true);
        expect(decoder([1, 2, 3, 'foo', 4]).isErr()).toBe(true);
        expect(decoder([1, 2, 'foo', 3, 4]).isErr()).toBe(true);
        expect(decoder([1, 'foo', 2, 3, 4]).isErr()).toBe(true);
        expect(decoder(['foo', 1, 2, 3, 4]).isErr()).toBe(true);
    });

    it('tuple6', () => {
        const decoder = tuple6(number, number, number, number, number, number);
        expect(decoder([1, 2, 3, 4, 5, 6]).isOk()).toBe(true);
        expect(decoder([]).isErr()).toBe(true);
        expect(decoder([1]).isErr()).toBe(true);
        expect(decoder([1, 2]).isErr()).toBe(true);
        expect(decoder([1, 2, 3]).isErr()).toBe(true);
        expect(decoder([1, 2, 3, 4]).isErr()).toBe(true);
        expect(decoder([1, 2, 3, 4, 5]).isErr()).toBe(true);
        expect(decoder([1, 2, 3, 4, 5, 'foo']).isErr()).toBe(true);
        expect(decoder([1, 2, 3, 4, 'foo', 5]).isErr()).toBe(true);
        expect(decoder([1, 2, 3, 'foo', 4, 5]).isErr()).toBe(true);
        expect(decoder([1, 2, 'foo', 3, 4, 5]).isErr()).toBe(true);
        expect(decoder([1, 'foo', 2, 3, 4, 5]).isErr()).toBe(true);
        expect(decoder(['foo', 1, 2, 3, 4, 5]).isErr()).toBe(true);
    });
});
