import { array, nonEmptyArray, set, tuple } from '../arrays';
import { number } from '../numbers';
import { object } from '../objects';
import { string } from '../strings';

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
