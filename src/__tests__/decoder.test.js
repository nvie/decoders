// @flow

import { decoder } from '../decoder';
import { number } from '../number';
import { object } from '../object';

describe('decoder', () => {
    const dec = decoder(number);

    it('valid', () => {
        expect(dec(0)).toBe(0);
        expect(dec(1)).toBe(1);
        expect(dec(4)).toBe(4);
        expect(dec(-3)).toBe(-3);
        expect(dec(-3.14)).toBe(-3.14);
    });

    it('invalid', () => {
        expect(() => dec('foo')).toThrow('Must be number');
    });
});
