// @flow

import { decodeArray } from '../array';
import { decodeNumber } from '../number';
import { decodeString } from '../string';

describe('arrays', () => {
    it('composes array-of decoders', () => {
        const dec = decodeArray(decodeString());
        expect(dec([])).toEqual([]);
        expect(dec(['foo', 'bar'])).toEqual(['foo', 'bar']);
    });

    it('composes nested array-of decoders', () => {
        const dec = decodeArray(decodeArray(decodeNumber()));
        expect(dec([])).toEqual([]);
        expect(dec([[]])).toEqual([[]]);
        expect(dec([[1, 2], [], [3, 4, 5]])).toEqual([[1, 2], [], [3, 4, 5]]);
    });
});
