// @flow

import { describe, it, expect } from 'jest';
import { decodeString } from '../primitives';
import { map } from '../transform';

describe('compose using map', () => {
    it('map produces derived decoders', () => {
        const decodeHex = map(
            // We already know how to decode strings...
            decodeString(),
            // So by passing it a mapper function, we can create a derived
            // decoder that returns numbers, interpreted as base 16.
            s => parseInt(s, 16)
        );

        expect(decodeHex('DEADC0DE')).toEqual(0xdeadc0de);
    });

    it('map can produce same-type-different-value results, too', () => {
        const dec = map(decodeString(), s => s.toUpperCase());
        expect(dec('123')).toEqual('123');
        expect(dec('I am Hulk')).toEqual('I AM HULK');
    });
});
