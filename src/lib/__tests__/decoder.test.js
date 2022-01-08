// @flow strict

import { formatInline, formatShort } from '../../format';
import { number } from '../numbers';

describe('guard', () => {
    it('valid', () => {
        const decoder = number;
        expect(decoder.verify(0)).toBe(0);
        expect(decoder.verify(1)).toBe(1);
        expect(decoder.verify(4)).toBe(4);
        expect(decoder.verify(-3)).toBe(-3);
        expect(decoder.verify(-3.14)).toBe(-3.14);
    });

    it('invalid', () => {
        const decoder = number;
        expect(() => decoder.verify('foo')).toThrow('Must be number');
    });

    it('different erroring styles', () => {
        const decoder = number;

        // Default
        expect(() => decoder.verify('xyz')).toThrow('xyz');
        expect(() => decoder.verify('xyz')).toThrow('Must be number');

        // Same as default
        expect(() => decoder.verify('xyz', formatInline)).toThrow('xyz');
        expect(() => decoder.verify('xyz', formatInline)).toThrow('Must be number');

        // Without echoing back the inputs
        expect(() => decoder.verify('xyz', formatShort)).not.toThrow('xyz');
        //                                               ^^^ Make sure the input is _NOT_ echoed back
        expect(() => decoder.verify('xyz', formatShort)).toThrow(/Must be number/);
    });
});
