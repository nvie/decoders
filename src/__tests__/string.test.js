// @flow

import { decodeString } from '../index';

describe('decodes strings from JSON', () => {
    const decoder = decodeString();

    it('simply returns strings if inputs are strings', () => {
        expect(decoder('')).toBe('');
        expect(decoder('foo')).toBe('foo');
        expect(decoder(' 1 2 3 ')).toBe(' 1 2 3 ');
    });

    it('throws runtime error if inputs are not strings', () => {
        expect(() => decoder(1)).toThrow();
        expect(() => decoder(true)).toThrow();
        expect(() => decoder(null)).toThrow();
        expect(() => decoder(undefined)).toThrow();
        expect(() => decoder(NaN)).toThrow();
        expect(() => decoder(1 / 0)).toThrow();
    });
});
