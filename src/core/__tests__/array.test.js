// @flow strict

import { array, nonEmptyArray } from '../array';
import { guard } from '../../_guard';
import { number } from '../number';
import { object } from '../object';
import { string } from '../string';
import { unwrap } from '../../result';

describe('array', () => {
    it('empty array', () => {
        // What type it is does not matter if the array is empty
        expect(unwrap(array(string)([]))).toEqual([]);
        expect(unwrap(array(number)([]))).toEqual([]);
        expect(unwrap(array(array(array(array(number))))([]))).toEqual([]);
    });

    it('simple nesting', () => {
        const verifier1 = array(string);
        expect(unwrap(verifier1([]))).toEqual([]);
        expect(unwrap(verifier1(['foo', 'bar']))).toEqual(['foo', 'bar']);

        const verifier2 = array(number);
        expect(unwrap(verifier2([]))).toEqual([]);
        expect(unwrap(verifier2([0, 1, 2, Math.PI]))).toEqual([0, 1, 2, Math.PI]);
    });

    it('complex nesting decoding', () => {
        const decoder = array(array(number));
        expect(unwrap(decoder([]))).toEqual([]);
        expect(unwrap(decoder([[]]))).toEqual([[]]);
        expect(unwrap(decoder([[1, 2], [], [3, 4, 5]]))).toEqual([[1, 2], [], [3, 4, 5]]);
    });

    it('failure to unpack', () => {
        const g = guard(array(string));
        expect(() => g('boop')).toThrow('Must be an array');
        expect(() => g([42])).toThrow('Must be string (at index 0)');
        expect(() => g(['foo', 'bar', 42])).toThrow('Must be string (at index 2)');

        const g2 = guard(array(object({ name: string })));
        expect(() => g2([{ name: 123 }])).toThrow('^ index 0');
    });
});

describe('nonEmptyArray', () => {
    const strings = guard(nonEmptyArray(string));
    const numbers = guard(nonEmptyArray(number));

    it('works like normal array', () => {
        expect(strings(['foo', 'bar'])).toEqual(['foo', 'bar']);
        expect(numbers([1, 2, 3])).toEqual([1, 2, 3]);

        expect(() => strings([1])).toThrow('Must be string');
        expect(() => numbers(['foo'])).toThrow('Must be number');
    });

    it('but empty array throw, too', () => {
        expect(() => strings([])).toThrow('Must be non-empty array');
        expect(() => numbers([])).toThrow('Must be non-empty array');
    });
});
