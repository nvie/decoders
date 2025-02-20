import { describe, expect, test } from 'vitest';

import { difference } from '~/lib/set-methods.js';
import { indent } from '~/lib/text.js';
import type { Scalar } from '~/lib/types.js';

describe('subtract', () => {
  const exampleSets: Set<Scalar>[] = [
    new Set(),
    new Set([]),
    new Set(['a', 'b', 'c']),
    new Set([1, 2, 3]),
  ];

  test('subtract(x, ∅) -> x', () => {
    for (const example of exampleSets) {
      expect(difference(example, new Set())).toEqual(example);
    }
  });

  test('subtract(∅, x) -> ∅', () => {
    for (const example of exampleSets) {
      expect(difference(new Set<Scalar>(), example)).toEqual(new Set());
    }
  });

  test('subtract(x, x) -> ∅', () => {
    for (const example of exampleSets) {
      expect(difference(example, example)).toEqual(new Set());
    }
  });

  test('subtract(x, y)', () => {
    expect(difference(new Set(['a', 'b', 'c']), new Set(['b', 'c']))).toEqual(
      new Set(['a']),
    );
    expect(
      difference(new Set(['a', 'b', 'c']), new Set(['b', 'b', 'b', 'b', 'c'])),
    ).toEqual(new Set(['a']));
    expect(difference(new Set(['a', 'b', 'c']), new Set(['d', 'e', 'f']))).toEqual(
      new Set(['a', 'b', 'c']),
    );
  });
});

describe('indent', () => {
  test('simple', () => {
    expect(indent('foo')).toBe('  foo');
    expect(indent('foo', '    ')).toBe('    foo');
  });
});
