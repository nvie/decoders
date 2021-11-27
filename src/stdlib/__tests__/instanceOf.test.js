// @flow strict

import { guard } from '../../_guard';
import { instanceOf } from '../instanceOf';

describe('instanceOf', () => {
    const errorDecoder = guard(instanceOf(Error));
    const typeErrorDecoder = guard(instanceOf(TypeError));

    it('accepts', () => {
        const e = new Error('foo');
        const t = new TypeError('bar'); // Subclasses are also allowed

        expect(errorDecoder(e)).toEqual(e);
        expect(typeErrorDecoder(t)).toEqual(t);

        // A TypeError is also an Error (since it's a subclass), but not the
        // other way around!
        expect(errorDecoder(t)).toEqual(t);
        expect(() => typeErrorDecoder(e)).toThrow('Must be TypeError instance');
    });

    it('rejects', () => {
        expect(() => errorDecoder('123')).toThrow('Must be Error instance');
        expect(() => errorDecoder(123)).toThrow('Must be Error instance');
        expect(() => errorDecoder({})).toThrow('Must be Error instance');
        expect(() => errorDecoder(null)).toThrow('Must be Error instance');
        expect(() => errorDecoder(undefined)).toThrow('Must be Error instance');
    });
});
