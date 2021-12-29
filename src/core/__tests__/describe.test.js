// @flow strict

import { constant } from '../constants';
import { describe as describe_ } from '../describe';
import { either } from '../either';
import { guard } from '../../_guard';

describe('describe', () => {
    const verify = guard(
        describe_(either(constant('a'), constant('b'), constant('c')), 'Must be ABC'),
    );

    it('valid', () => {
        expect(verify('a')).toBe('a');
        expect(verify('b')).toBe('b');
        expect(verify('c')).toBe('c');
    });

    it('invalid', () => {
        expect(() => verify('invalid')).toThrow(/Must be ABC/);
    });
});
