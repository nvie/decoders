// @flow strict
/* eslint-disable no-restricted-syntax */

import { guard } from '../guard';
import { number } from '../number';

describe('guard', () => {
    it('valid', () => {
        const dec = guard(number);
        expect(dec(0)).toBe(0);
        expect(dec(1)).toBe(1);
        expect(dec(4)).toBe(4);
        expect(dec(-3)).toBe(-3);
        expect(dec(-3.14)).toBe(-3.14);
    });

    it('invalid', () => {
        const dec = guard(number);
        expect(() => dec('foo')).toThrow('Must be number');
    });

    it('different erroring styles', () => {
        // These are all the same and echo back the original input
        const dec0 = guard(number);
        const dec1 = guard(number, {});
        const dec2 = guard(number, { style: 'inline' });

        // These are all the same and echo back the original input
        expect(() => dec0('xyz')).toThrow('xyz');
        expect(() => dec0('xyz')).toThrow('Must be number');
        expect(() => dec1('xyz')).toThrow('xyz');
        expect(() => dec1('xyz')).toThrow('Must be number');
        expect(() => dec2('xyz')).toThrow('xyz');
        expect(() => dec2('xyz')).toThrow('Must be number');

        // These are all the same and echo back the original input
        const dec3 = guard(number, { style: 'simple' });

        // These are all the same and echo back the original input
        expect(() => dec3('xyz')).not.toThrow('xyz');
        expect(() => dec3('xyz')).toThrow(/Must be number/);
    });
});
