import { describe, expect, test } from 'vitest';

import { indent } from '~/lib/text';

describe('indent', () => {
  test('simple', () => {
    expect(indent('foo')).toBe('  foo');
    expect(indent('foo', '    ')).toBe('    foo');
  });
});
