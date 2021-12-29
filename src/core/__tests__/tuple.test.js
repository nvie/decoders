// @flow strict

import { number } from '../number';
import { string } from '../string';
import { tuple } from '../tuple';
import { unwrap } from '../../result';

describe('tuples', () => {
    it('1-tuples', () => {
        const decoder = tuple(string);
        expect(unwrap(decoder(['foo']))).toEqual(['foo']);
        expect(decoder(['foo', 'bar']).ok).toBe(false);
        expect(decoder([42]).ok).toBe(false);
        expect(decoder([42, 13]).ok).toBe(false);

        // Invalid
        expect(decoder('not an array').ok).toBe(false);
        expect(decoder(undefined).ok).toBe(false);

        // Wrong arity (not a 1-tuple)
        expect(decoder([]).ok).toBe(false);
        expect(decoder(['foo', 42, true]).ok).toBe(false);
    });

    it('2-tuples', () => {
        const decoder = tuple(string, number);
        expect(unwrap(decoder(['foo', 42]))).toEqual(['foo', 42]);
        expect(decoder(['foo', 'bar']).ok).toBe(false);
        expect(decoder([42, 'foo']).ok).toBe(false);
        expect(decoder([42, 13]).ok).toBe(false);

        // Invalid
        expect(decoder('not an array').ok).toBe(false);
        expect(decoder(undefined).ok).toBe(false);

        // Wrong arity (not a 2-tuple)
        expect(decoder([]).ok).toBe(false);
        expect(decoder(['foo']).ok).toBe(false);
        expect(decoder(['foo', 42, true]).ok).toBe(false);
    });

    it('3-tuples', () => {
        const decoder = tuple(number, number, number);
        expect(decoder([1, 2, 3]).ok).toBe(true);
        expect(decoder([]).ok).toBe(false);
        expect(decoder([1]).ok).toBe(false);
        expect(decoder([1, 2]).ok).toBe(false);
        expect(decoder([1, 2, 'foo']).ok).toBe(false);
        expect(decoder([1, 'foo', 2]).ok).toBe(false);
        expect(decoder(['foo', 1, 2]).ok).toBe(false);
    });

    it('4-tuples', () => {
        const decoder = tuple(number, number, number, number);
        expect(decoder([1, 2, 3, 4]).ok).toBe(true);
        expect(decoder([]).ok).toBe(false);
        expect(decoder([1]).ok).toBe(false);
        expect(decoder([1, 2]).ok).toBe(false);
        expect(decoder([1, 2, 3]).ok).toBe(false);
        expect(decoder([1, 2, 3, 'foo']).ok).toBe(false);
        expect(decoder([1, 2, 'foo', 3]).ok).toBe(false);
        expect(decoder([1, 'foo', 2, 3]).ok).toBe(false);
        expect(decoder(['foo', 1, 2, 3]).ok).toBe(false);
    });

    it('5-tuples', () => {
        const decoder = tuple(number, number, number, number, number);
        expect(decoder([1, 2, 3, 4, 5]).ok).toBe(true);
        expect(decoder([]).ok).toBe(false);
        expect(decoder([1]).ok).toBe(false);
        expect(decoder([1, 2]).ok).toBe(false);
        expect(decoder([1, 2, 3]).ok).toBe(false);
        expect(decoder([1, 2, 3, 4]).ok).toBe(false);
        expect(decoder([1, 2, 3, 4, 'foo']).ok).toBe(false);
        expect(decoder([1, 2, 3, 'foo', 4]).ok).toBe(false);
        expect(decoder([1, 2, 'foo', 3, 4]).ok).toBe(false);
        expect(decoder([1, 'foo', 2, 3, 4]).ok).toBe(false);
        expect(decoder(['foo', 1, 2, 3, 4]).ok).toBe(false);
    });

    it('6-tuples', () => {
        const decoder = tuple(number, number, number, number, number, number);
        expect(decoder([1, 2, 3, 4, 5, 6]).ok).toBe(true);
        expect(decoder([]).ok).toBe(false);
        expect(decoder([1]).ok).toBe(false);
        expect(decoder([1, 2]).ok).toBe(false);
        expect(decoder([1, 2, 3]).ok).toBe(false);
        expect(decoder([1, 2, 3, 4]).ok).toBe(false);
        expect(decoder([1, 2, 3, 4, 5]).ok).toBe(false);
        expect(decoder([1, 2, 3, 4, 5, 'foo']).ok).toBe(false);
        expect(decoder([1, 2, 3, 4, 'foo', 5]).ok).toBe(false);
        expect(decoder([1, 2, 3, 'foo', 4, 5]).ok).toBe(false);
        expect(decoder([1, 2, 'foo', 3, 4, 5]).ok).toBe(false);
        expect(decoder([1, 'foo', 2, 3, 4, 5]).ok).toBe(false);
        expect(decoder(['foo', 1, 2, 3, 4, 5]).ok).toBe(false);
    });
});
