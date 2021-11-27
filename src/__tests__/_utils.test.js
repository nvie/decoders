// @flow strict

import { indent } from '../_utils';

describe('indent', () => {
    it('simple', () => {
        expect(indent('foo')).toBe('  foo');
        expect(indent('foo', '    ')).toBe('    foo');
    });
});
