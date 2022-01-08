// @flow strict

import { array, nonEmptyArray, set } from '../array';
import { number } from '../number';
import { object } from '../object';
import { string } from '../string';

describe('array', () => {
    it('empty array', () => {
        // What type it is does not matter if the array is empty
        expect(array(string).verify([])).toEqual([]);
        expect(array(number).verify([])).toEqual([]);
        expect(array(array(array(array(number)))).verify([])).toEqual([]);
    });

    it('simple nesting', () => {
        const verifier1 = array(string);
        expect(verifier1.verify([])).toEqual([]);
        expect(verifier1.verify(['foo', 'bar'])).toEqual(['foo', 'bar']);

        const verifier2 = array(number);
        expect(verifier2.verify([])).toEqual([]);
        expect(verifier2.verify([0, 1, 2, Math.PI])).toEqual([0, 1, 2, Math.PI]);
    });

    it('complex nesting decoding', () => {
        const decoder = array(array(number));
        expect(decoder.verify([])).toEqual([]);
        expect(decoder.verify([[]])).toEqual([[]]);
        expect(decoder.verify([[1, 2], [], [3, 4, 5]])).toEqual([[1, 2], [], [3, 4, 5]]);
    });

    it('failure to unpack', () => {
        const decoder = array(string);
        expect(() => decoder.verify('boop')).toThrow('Must be an array');
        expect(() => decoder.verify([42])).toThrow('Must be string (at index 0)');
        expect(() => decoder.verify(['foo', 'bar', 42])).toThrow(
            'Must be string (at index 2)',
        );

        const decoder2 = array(object({ name: string }));
        expect(() => decoder2.verify([{ name: 123 }])).toThrow('^ index 0');
    });
});

describe('nonEmptyArray', () => {
    const strings = nonEmptyArray(string);
    const numbers = nonEmptyArray(number);

    it('works like normal array', () => {
        expect(strings.verify(['foo', 'bar'])).toEqual(['foo', 'bar']);
        expect(numbers.verify([1, 2, 3])).toEqual([1, 2, 3]);

        expect(() => strings.verify([1])).toThrow('Must be string');
        expect(() => numbers.verify(['foo'])).toThrow('Must be number');
    });

    it('but empty array throw, too', () => {
        expect(() => strings.verify([])).toThrow('Must be non-empty array');
        expect(() => numbers.verify([])).toThrow('Must be non-empty array');
    });
});

describe('set', () => {
    const decoder = set(string);

    it('empty set', () => {
        expect(decoder.verify([]).size).toBe(0);
    });

    it('accepts', () => {
        const r = decoder.verify(['foo', 'bar']);
        expect(r.has('foo')).toBe(true);
        expect(r.has('bar')).toBe(true);
        expect(r.size).toBe(2);
    });

    it('rejects', () => {
        expect(decoder.decode([1]).ok).toBe(false);
        expect(decoder.decode(1).ok).toBe(false);
    });
});
