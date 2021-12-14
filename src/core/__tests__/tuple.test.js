// @flow strict

import { number } from '../number';
import { string } from '../string';
import { tuple1, tuple2, tuple3, tuple4, tuple5, tuple6 } from '../tuple';
import { unwrap } from '../../result';

describe('tuples', () => {
    it('tuple1', () => {
        const decoder = tuple1(string);
        expect(unwrap(decoder(['foo']))).toEqual(['foo']);
        expect(decoder(['foo', 'bar']).type).toBe('err');
        expect(decoder([42]).type).toBe('err');
        expect(decoder([42, 13]).type).toBe('err');

        // Invalid
        expect(decoder('not an array').type).toBe('err');
        expect(decoder(undefined).type).toBe('err');

        // Wrong arity (not a 1-tuple)
        expect(decoder([]).type).toBe('err');
        expect(decoder(['foo', 42, true]).type).toBe('err');
    });

    it('tuple2', () => {
        const decoder = tuple2(string, number);
        expect(unwrap(decoder(['foo', 42]))).toEqual(['foo', 42]);
        expect(decoder(['foo', 'bar']).type).toBe('err');
        expect(decoder([42, 'foo']).type).toBe('err');
        expect(decoder([42, 13]).type).toBe('err');

        // Invalid
        expect(decoder('not an array').type).toBe('err');
        expect(decoder(undefined).type).toBe('err');

        // Wrong arity (not a 2-tuple)
        expect(decoder([]).type).toBe('err');
        expect(decoder(['foo']).type).toBe('err');
        expect(decoder(['foo', 42, true]).type).toBe('err');
    });

    it('tuple3', () => {
        const decoder = tuple3(number, number, number);
        expect(decoder([1, 2, 3]).type).toBe('ok');
        expect(decoder([]).type).toBe('err');
        expect(decoder([1]).type).toBe('err');
        expect(decoder([1, 2]).type).toBe('err');
        expect(decoder([1, 2, 'foo']).type).toBe('err');
        expect(decoder([1, 'foo', 2]).type).toBe('err');
        expect(decoder(['foo', 1, 2]).type).toBe('err');
    });

    it('tuple4', () => {
        const decoder = tuple4(number, number, number, number);
        expect(decoder([1, 2, 3, 4]).type).toBe('ok');
        expect(decoder([]).type).toBe('err');
        expect(decoder([1]).type).toBe('err');
        expect(decoder([1, 2]).type).toBe('err');
        expect(decoder([1, 2, 3]).type).toBe('err');
        expect(decoder([1, 2, 3, 'foo']).type).toBe('err');
        expect(decoder([1, 2, 'foo', 3]).type).toBe('err');
        expect(decoder([1, 'foo', 2, 3]).type).toBe('err');
        expect(decoder(['foo', 1, 2, 3]).type).toBe('err');
    });

    it('tuple5', () => {
        const decoder = tuple5(number, number, number, number, number);
        expect(decoder([1, 2, 3, 4, 5]).type).toBe('ok');
        expect(decoder([]).type).toBe('err');
        expect(decoder([1]).type).toBe('err');
        expect(decoder([1, 2]).type).toBe('err');
        expect(decoder([1, 2, 3]).type).toBe('err');
        expect(decoder([1, 2, 3, 4]).type).toBe('err');
        expect(decoder([1, 2, 3, 4, 'foo']).type).toBe('err');
        expect(decoder([1, 2, 3, 'foo', 4]).type).toBe('err');
        expect(decoder([1, 2, 'foo', 3, 4]).type).toBe('err');
        expect(decoder([1, 'foo', 2, 3, 4]).type).toBe('err');
        expect(decoder(['foo', 1, 2, 3, 4]).type).toBe('err');
    });

    it('tuple6', () => {
        const decoder = tuple6(number, number, number, number, number, number);
        expect(decoder([1, 2, 3, 4, 5, 6]).type).toBe('ok');
        expect(decoder([]).type).toBe('err');
        expect(decoder([1]).type).toBe('err');
        expect(decoder([1, 2]).type).toBe('err');
        expect(decoder([1, 2, 3]).type).toBe('err');
        expect(decoder([1, 2, 3, 4]).type).toBe('err');
        expect(decoder([1, 2, 3, 4, 5]).type).toBe('err');
        expect(decoder([1, 2, 3, 4, 5, 'foo']).type).toBe('err');
        expect(decoder([1, 2, 3, 4, 'foo', 5]).type).toBe('err');
        expect(decoder([1, 2, 3, 'foo', 4, 5]).type).toBe('err');
        expect(decoder([1, 2, 'foo', 3, 4, 5]).type).toBe('err');
        expect(decoder([1, 'foo', 2, 3, 4, 5]).type).toBe('err');
        expect(decoder(['foo', 1, 2, 3, 4, 5]).type).toBe('err');
    });
});
