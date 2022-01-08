// @flow strict

import { number } from '../number';
import { string } from '../string';
import { tuple } from '../tuple';
import { unwrap } from '../../result';

describe('tuples', () => {
    it('1-tuples', () => {
        const decoder = tuple(string);
        expect(decoder.verify(['foo'])).toEqual(['foo']);
        expect(decoder.decode(['foo', 'bar']).ok).toBe(false);
        expect(decoder.decode([42]).ok).toBe(false);
        expect(decoder.decode([42, 13]).ok).toBe(false);

        // Invalid
        expect(decoder.decode('not an array').ok).toBe(false);
        expect(decoder.decode(undefined).ok).toBe(false);

        // Wrong arity (not a 1-tuple)
        expect(decoder.decode([]).ok).toBe(false);
        expect(decoder.decode(['foo', 42, true]).ok).toBe(false);
    });

    it('2-tuples', () => {
        const decoder = tuple(string, number);
        expect(decoder.verify(['foo', 42])).toEqual(['foo', 42]);
        expect(decoder.decode(['foo', 'bar']).ok).toBe(false);
        expect(decoder.decode([42, 'foo']).ok).toBe(false);
        expect(decoder.decode([42, 13]).ok).toBe(false);

        // Invalid
        expect(decoder.decode('not an array').ok).toBe(false);
        expect(decoder.decode(undefined).ok).toBe(false);

        // Wrong arity (not a 2-tuple)
        expect(decoder.decode([]).ok).toBe(false);
        expect(decoder.decode(['foo']).ok).toBe(false);
        expect(decoder.decode(['foo', 42, true]).ok).toBe(false);
    });

    it('3-tuples', () => {
        const decoder = tuple(number, number, number);
        expect(decoder.decode([1, 2, 3]).ok).toBe(true);
        expect(decoder.decode([]).ok).toBe(false);
        expect(decoder.decode([1]).ok).toBe(false);
        expect(decoder.decode([1, 2]).ok).toBe(false);
        expect(decoder.decode([1, 2, 'foo']).ok).toBe(false);
        expect(decoder.decode([1, 'foo', 2]).ok).toBe(false);
        expect(decoder.decode(['foo', 1, 2]).ok).toBe(false);
    });

    it('4-tuples', () => {
        const decoder = tuple(number, number, number, number);
        expect(decoder.decode([1, 2, 3, 4]).ok).toBe(true);
        expect(decoder.decode([]).ok).toBe(false);
        expect(decoder.decode([1]).ok).toBe(false);
        expect(decoder.decode([1, 2]).ok).toBe(false);
        expect(decoder.decode([1, 2, 3]).ok).toBe(false);
        expect(decoder.decode([1, 2, 3, 'foo']).ok).toBe(false);
        expect(decoder.decode([1, 2, 'foo', 3]).ok).toBe(false);
        expect(decoder.decode([1, 'foo', 2, 3]).ok).toBe(false);
        expect(decoder.decode(['foo', 1, 2, 3]).ok).toBe(false);
    });

    it('5-tuples', () => {
        const decoder = tuple(number, number, number, number, number);
        expect(decoder.decode([1, 2, 3, 4, 5]).ok).toBe(true);
        expect(decoder.decode([]).ok).toBe(false);
        expect(decoder.decode([1]).ok).toBe(false);
        expect(decoder.decode([1, 2]).ok).toBe(false);
        expect(decoder.decode([1, 2, 3]).ok).toBe(false);
        expect(decoder.decode([1, 2, 3, 4]).ok).toBe(false);
        expect(decoder.decode([1, 2, 3, 4, 'foo']).ok).toBe(false);
        expect(decoder.decode([1, 2, 3, 'foo', 4]).ok).toBe(false);
        expect(decoder.decode([1, 2, 'foo', 3, 4]).ok).toBe(false);
        expect(decoder.decode([1, 'foo', 2, 3, 4]).ok).toBe(false);
        expect(decoder.decode(['foo', 1, 2, 3, 4]).ok).toBe(false);
    });

    it('6-tuples', () => {
        const decoder = tuple(number, number, number, number, number, number);
        expect(decoder.decode([1, 2, 3, 4, 5, 6]).ok).toBe(true);
        expect(decoder.decode([]).ok).toBe(false);
        expect(decoder.decode([1]).ok).toBe(false);
        expect(decoder.decode([1, 2]).ok).toBe(false);
        expect(decoder.decode([1, 2, 3]).ok).toBe(false);
        expect(decoder.decode([1, 2, 3, 4]).ok).toBe(false);
        expect(decoder.decode([1, 2, 3, 4, 5]).ok).toBe(false);
        expect(decoder.decode([1, 2, 3, 4, 5, 'foo']).ok).toBe(false);
        expect(decoder.decode([1, 2, 3, 4, 'foo', 5]).ok).toBe(false);
        expect(decoder.decode([1, 2, 3, 'foo', 4, 5]).ok).toBe(false);
        expect(decoder.decode([1, 2, 'foo', 3, 4, 5]).ok).toBe(false);
        expect(decoder.decode([1, 'foo', 2, 3, 4, 5]).ok).toBe(false);
        expect(decoder.decode(['foo', 1, 2, 3, 4, 5]).ok).toBe(false);
    });
});
