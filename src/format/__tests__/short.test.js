// @flow strict

import { annotate } from '../../annotate';
import { formatShort } from '../short';

function check(input, expected) {
    expect(formatShort(annotate(input))).toEqual(expected);
}

describe('summarize', () => {
    it('summarizes normal JS values', () => {
        check(1234, []);
        check(true, []);
        check('foo', []);
        check(['foo', 123], []);
    });

    it('serializes annotated primitives', () => {
        check(annotate(123, 'a number'), ['a number']);
        check(annotate(true, 'not false'), ['not false']);
        check(annotate('foo', 'This is a foo'), ['This is a foo']);
    });

    it('prints annotations with multiple lines', () => {
        check([annotate(123, 'Must be string')], ['Value at index 0: Must be string']);
        check({ name: annotate(123, 'Must be string') }, [
            'Value at key "name": Must be string',
        ]);
    });

    it('multiple annotations, deeply nested', () => {
        check(
            [[{ name: annotate(1234, 'ABC') }], annotate(true, 'not false')],
            ['Value at keypath 0.0.name: ABC', 'Value at index 1: not false'],
        );
    });

    it('objects/arrays that are themselves annotated', () => {
        check(
            [
                {
                    name: annotate(
                        [1, 2, annotate('3', 'Must be number')],
                        'Must have at most 2 values',
                    ),
                },
            ],
            [
                'Value at keypath 0.name.2: Must be number',
                'Value at keypath 0.name: Must have at most 2 values',
            ],
        );
        check(
            [annotate({ name: annotate(123, 'Must be number') }, 'Missing key "foo"')],
            [
                'Value at keypath 0.name: Must be number',
                'Value at index 0: Missing key "foo"',
            ],
        );
    });
});
