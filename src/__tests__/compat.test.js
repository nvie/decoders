// @flow

import { decodeObject, decodeString } from '../compat';

describe('old-style decoders', () => {
    const decoder = decodeObject({ name: decodeString() });

    it('valid', () => {
        expect(decoder({ name: 'Foo' })).toEqual({ name: 'Foo' });
    });

    it('invalid', () => {
        expect(() => decoder({ name: 123 })).toThrow('Unexpected object shape');
        expect(() => {
            try {
                decoder({ name: 123 });
            } catch (e) {
                // Throw the child error
                throw e.parents[0];
            }
        }).toThrow('Must be string');
    });
});
