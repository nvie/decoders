// @flow strict

import { instanceOf } from '../instanceOf';

describe('instanceOf', () => {
    const errorDecoder = instanceOf(Error);
    const typeErrorDecoder = instanceOf(TypeError);

    it('accepts', () => {
        const e = new Error('foo');
        const t = new TypeError('bar'); // Subclasses are also allowed

        expect(errorDecoder.verify(e)).toEqual(e);
        expect(typeErrorDecoder.verify(t)).toEqual(t);

        // A TypeError is also an Error (since it's a subclass), but not the
        // other way around!
        expect(errorDecoder.verify(t)).toEqual(t);
        expect(() => typeErrorDecoder.verify(e)).toThrow('Must be TypeError instance');
    });

    it('rejects', () => {
        expect(() => errorDecoder.verify('123')).toThrow('Must be Error instance');
        expect(() => errorDecoder.verify(123)).toThrow('Must be Error instance');
        expect(() => errorDecoder.verify({})).toThrow('Must be Error instance');
        expect(() => errorDecoder.verify(null)).toThrow('Must be Error instance');
        expect(() => errorDecoder.verify(undefined)).toThrow('Must be Error instance');
    });
});
