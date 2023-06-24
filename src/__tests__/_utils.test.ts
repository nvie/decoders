/* eslint-disable no-restricted-syntax */

import { indent, subtract } from '../_utils';
import type { Scalar } from '../Decoder';

describe('subtract', () => {
    const exampleSets: Array<Set<Scalar>> = [
        new Set(),
        new Set([]),
        new Set(['a', 'b', 'c']),
        new Set([1, 2, 3]),
    ];

    it('subtract(x, ∅) -> x', () => {
        for (const example of exampleSets) {
            expect(subtract(example, new Set())).toEqual(example);
        }
    });

    it('subtract(∅, x) -> ∅', () => {
        for (const example of exampleSets) {
            expect(subtract(new Set(), example)).toEqual(new Set());
        }
    });

    it('subtract(x, x) -> ∅', () => {
        for (const example of exampleSets) {
            expect(subtract(example, example)).toEqual(new Set());
        }
    });

    it('subtract(x, y)', () => {
        expect(subtract(new Set(['a', 'b', 'c']), new Set(['b', 'c']))).toEqual(
            new Set(['a']),
        );
        expect(
            subtract(new Set(['a', 'b', 'c']), new Set(['b', 'b', 'b', 'b', 'c'])),
        ).toEqual(new Set(['a']));
        expect(subtract(new Set(['a', 'b', 'c']), new Set(['d', 'e', 'f']))).toEqual(
            new Set(['a', 'b', 'c']),
        );
    });
});

describe('indent', () => {
    it('simple', () => {
        expect(indent('foo')).toBe('  foo');
        expect(indent('foo', '    ')).toBe('    foo');
    });
});
