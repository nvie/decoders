// @flow

import { decodeNumber } from '../number';
import { oneOf } from '../oneOf';
import { decodeString } from '../string';

describe('unions', () => {
    it('decodes union types', () => {
        const dec = oneOf(decodeString(), decodeNumber());
        expect(dec('ohai')).toEqual('ohai');
        expect(dec(1)).toEqual(1);
        expect(() => dec({ id: 1, name: 'test' })).toThrow();
        expect(() => dec(['ohai'])).toThrow();
        expect(() => dec(null)).toThrow();
    });
});
