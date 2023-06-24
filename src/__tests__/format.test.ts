import { __private_annotate, annotate } from '../annotate';
import { formatInline, formatShort } from '../format';

const whitespace_re = /^\s*$/;

export function dedent(value: string): string {
    let lines = value.split('\n');
    if (lines.length > 0 && whitespace_re.test(lines[0])) {
        lines.shift();
    }
    if (lines.length > 0 && whitespace_re.test(lines[lines.length - 1])) {
        lines.pop();
    }
    const level = Math.min(...lines.filter((s) => !!s).map((s) => s.search(/\S/)));
    const dedented = lines.map((value) => (value ? value.substring(level) : ''));
    return dedented.join('\n');
}

function checkInline(input, expected) {
    expect(formatInline(annotate(input))).toEqual(dedent(expected));
}

describe('formatInline', () => {
    it('serializes scalar values', () => {
        checkInline(undefined, 'undefined');
        checkInline(null, 'null');
        checkInline(1234, '1234');
        checkInline(true, 'true');
        checkInline('foo', '"foo"');
        checkInline(
            ['foo', 123],
            `
              [
                "foo",
                123,
              ]`,
        );
    });

    it('serializes functions', () => {
        checkInline(function () {}, '<function>');
        checkInline(() => {}, '<function>');
    });

    it('serializes annotated primitives', () => {
        checkInline(
            annotate(123, 'a number'),
            `
              123
              ^^^ a number
            `,
        );
        checkInline(
            annotate(true, 'not false'),
            `
              true
              ^^^^ not false
            `,
        );
        checkInline(
            annotate('foo', 'This is a foo'),
            `
              "foo"
              ^^^^^ This is a foo
            `,
        );
        checkInline(
            annotate(new Date(Date.UTC(2017, 11, 25)), 'Merry X-mas!'),
            `
              new Date("2017-12-25T00:00:00.000Z")
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Merry X-mas!
            `,
        );
        checkInline(
            annotate(new Date('not a date'), 'Nope'),
            `
              (Invalid Date)
              ^^^^^^^^^^^^^^ Nope
            `,
        );
        checkInline(
            annotate([], 'must not be empty'),
            `
              []
              ^^ must not be empty
            `,
        );
        checkInline(
            annotate({}, 'must not be empty'),
            `
              {}
              ^^ must not be empty
            `,
        );
        checkInline(
            annotate(() => {}, 'xxx'),
            `
              <function>
              ^^^^^^^^^^ xxx
            `,
        );
    });

    it('serializes w/ cyclical refs', () => {
        const value = {}; // just a dummy ref

        // Construct a fake circular ref by modifying the seen set directly
        const seen = new WeakSet();
        seen.add(value);
        checkInline(
            __private_annotate(value, 'xxx', seen),
            `
              <circular ref>
              ^^^^^^^^^^^^^^ xxx
            `,
        );
    });

    it('serializes w/ unknown values', () => {
        const value =
            // $FlowFixMe[bigint-unsupported] - Flow does not support bigint literals yet
            0n;

        checkInline(
            annotate(value, 'xxx'),
            `
              ???
              ^^^ xxx
            `,
        );
    });

    it('cannot format custom objects out of the box', () => {
        checkInline(
            annotate(Number.NEGATIVE_INFINITY, 'Not finite'),
            `
              -Infinity
              ^^^^^^^^^ Not finite
            `,
        );
    });

    it('prints annotations with multiple lines', () => {
        checkInline(
            [annotate(123, 'Must be one of:\n1. a float\n2. a string')],
            `
              [
                123,
                ^^^
                Must be one of:
                1. a float
                2. a string
              ]
            `,
        );
        checkInline(
            { name: annotate(123, 'Must be one of:\n1. a float\n2. a string') },
            `
              {
                "name": 123,
                        ^^^
                        Must be one of:
                        1. a float
                        2. a string
              }
            `,
        );
    });

    it('cuts off long strings beyond a certain length', () => {
        checkInline(
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.  Etiam lacus ligula, accumsan id imperdiet rhoncus, dapibus vitae arcu.  Nulla non quam erat, luctus consequat nisi.  Integer hendrerit lacus sagittis erat fermentum tincidunt.  Cras vel dui neque.  In sagittis commodo luctus.  Mauris non metus dolor, ut suscipit dui.  Aliquam mauris lacus, laoreet et consequat quis, bibendum id ipsum.  Donec gravida, diam id imperdiet cursus, nunc nisl bibendum sapien, eget tempor neque elit in tortor.',
            `
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit.  Etiam l..." [truncated]
            `,
        );
    });

    it('serializes data inside arrays', () => {
        checkInline(
            [[annotate(1234, 'ABC')], annotate(true, 'not false')],
            `
              [
                [
                  1234,
                  ^^^^ ABC
                ],
                true,
                ^^^^ not false
              ]
            `,
        );
    });

    it('objects that are themselves annotated', () => {
        checkInline(
            [annotate({ name: 123 }, 'Missing key "foo"')],
            `
              [
                {
                  "name": 123,
                },
                ^ Missing key "foo"
              ]
            `,
        );
    });

    it('serializes data inside objects', () => {
        checkInline(
            { name: annotate(123, 'The name should be a string') },
            `
              {
                "name": 123,
                        ^^^ The name should be a string
              }
            `,
        );
    });
});

function checkShort(input: mixed, expected: string) {
    expect(formatShort(annotate(input))).toEqual(expected);
}

describe('formatShort', () => {
    it('summarizes normal JS values', () => {
        checkShort(1234, '');
        checkShort(true, '');
        checkShort('foo', '');
        checkShort(['foo', 123], '');
    });

    it('serializes annotated primitives', () => {
        checkShort(annotate(123, 'a number'), 'a number');
        checkShort(annotate(true, 'not false'), 'not false');
        checkShort(annotate('foo', 'This is a foo'), 'This is a foo');
    });

    it('prints annotations with multiple lines', () => {
        checkShort([annotate(123, 'Must be string')], 'Value at index 0: Must be string');
        checkShort(
            { name: annotate(123, 'Must be string') },
            'Value at key "name": Must be string',
        );
    });

    it('multiple annotations, deeply nested', () => {
        checkShort(
            [[{ name: annotate(1234, 'ABC') }], annotate(true, 'not false')],
            'Value at keypath 0.0.name: ABC\nValue at index 1: not false',
        );
    });

    it('objects/arrays that are themselves annotated', () => {
        checkShort(
            [
                {
                    name: annotate(
                        [1, 2, annotate('3', 'Must be number')],
                        'Must have at most 2 values',
                    ),
                },
            ],
            'Value at keypath 0.name.2: Must be number\nValue at keypath 0.name: Must have at most 2 values',
        );
        checkShort(
            [annotate({ name: annotate(123, 'Must be number') }, 'Missing key "foo"')],
            'Value at keypath 0.name: Must be number\nValue at index 0: Missing key "foo"',
        );
    });
});
