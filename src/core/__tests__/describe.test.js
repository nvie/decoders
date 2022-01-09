// @flow strict

import { constant } from '../constants';
import { either } from '../either';

describe('describe', () => {
    const decoder = either(constant('a'), constant('b'), constant('c')).describe(
        'Must be ABC',
    );

    it('valid', () => {
        expect(decoder.verify('a')).toBe('a');
        expect(decoder.verify('b')).toBe('b');
        expect(decoder.verify('c')).toBe('c');
    });

    it('invalid', () => {
        expect(() => decoder.verify('invalid')).toThrow(/Must be ABC/);
    });
});
