// @flow

import { array } from '../array';
import { number } from '../number';
import { string } from '../string';

describe('array', () => {
    it('empty array', () => {
        // What type it is does not matter if the array is empty
        expect(array(string)([]).unwrap()).toEqual([]);
        expect(array(number)([]).unwrap()).toEqual([]);
        expect(array(array(array(array(number))))([]).unwrap()).toEqual([]);
    });

    it('simple nesting', () => {
        const verifier1 = array(string);
        expect(verifier1([]).unwrap()).toEqual([]);
        expect(verifier1(['foo', 'bar']).unwrap()).toEqual(['foo', 'bar']);

        const verifier2 = array(number);
        expect(verifier2([]).unwrap()).toEqual([]);
        expect(verifier2([0, 1, 2, Math.PI]).unwrap()).toEqual([0, 1, 2, Math.PI]);
    });

    it('complex nesting decoding', () => {
        const decoder = array(array(number));
        expect(decoder([]).unwrap()).toEqual([]);
        expect(decoder([[]]).unwrap()).toEqual([[]]);
        expect(decoder([[1, 2], [], [3, 4, 5]]).unwrap()).toEqual([[1, 2], [], [3, 4, 5]]);
    });

    it('failure to unpack', () => {
        const decoder = array(string);
        expect(() => decoder('boop').unwrap()).toThrow('Must be an array');
        expect(() => decoder([42]).unwrap()).toThrow('Unexpected value at index 0');
        expect(() => decoder(['foo', 'bar', 42]).unwrap()).toThrow('Unexpected value at index 2');
    });
});
