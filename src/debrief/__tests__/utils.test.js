// @flow strict

import { indent } from '../utils';

describe('indent', () => {
    it('simple', () => {
        expect(indent('foo')).toBe('  foo');
        expect(indent('foo', '    ')).toBe('    foo');
    });
});
