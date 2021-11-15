// @flow strict

import { dedent } from './helpers';
import annotate from '../annotate';
import serialize from '../serialize';

function debrief(input, expected) {
    expect(serialize(annotate(input))).toEqual(dedent(expected));
}

describe('serialize', () => {
    it('serializes scalar values', () => {
        debrief(undefined, 'undefined');
        debrief(null, 'null');
        debrief(1234, '1234');
        debrief(true, 'true');
        debrief('foo', '"foo"');
        debrief(
            ['foo', 123],
            `
              [
                "foo",
                123,
              ]`,
        );
    });

    it('serializes functions', () => {
        debrief(function () {}, 'function() {}');
        debrief(() => {}, 'function() {}');
    });

    it('serializes annotated primitives', () => {
        debrief(
            annotate(123, 'a number'),
            `
              123
              ^^^ a number
            `,
        );
        debrief(
            annotate(true, 'not false'),
            `
              true
              ^^^^ not false
            `,
        );
        debrief(
            annotate('foo', 'This is a foo'),
            `
              "foo"
              ^^^^^ This is a foo
            `,
        );
        debrief(
            annotate(new Date(Date.UTC(2017, 11, 25)), 'Merry X-mas!'),
            `
              new Date("2017-12-25T00:00:00.000Z")
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Merry X-mas!
            `,
        );
        debrief(
            annotate(new Date('not a date'), 'Nope'),
            `
              (Invalid Date)
              ^^^^^^^^^^^^^^ Nope
            `,
        );
        debrief(
            annotate([], 'must not be empty'),
            `
              []
              ^^ must not be empty
            `,
        );
        debrief(
            annotate({}, 'must not be empty'),
            `
              {}
              ^^ must not be empty
            `,
        );
        debrief(
            annotate(() => {}, 'xxx'),
            `
              function() {}
              ^^^^^^^^^^^^^ xxx
            `,
        );
    });

    it('serializes w/ cyclical refs', () => {
        const value = {}; // just a dummy ref

        // Construct a fake circular ref by modifying the seen set directly
        const seen = new WeakSet();
        seen.add(value);
        debrief(
            annotate(value, 'xxx', seen),
            `
              <circular ref>
              ^^^^^^^^^^^^^^ xxx
            `,
        );
    });

    it('cannot serialize custom objects out of the box', () => {
        debrief(
            annotate(Number.NEGATIVE_INFINITY, 'Not finite'),
            `
              -Infinity
              ^^^^^^^^^ Not finite
            `,
        );
    });

    it('prints annotations with multiple lines', () => {
        debrief(
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
        debrief(
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
        debrief(
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.  Etiam lacus ligula, accumsan id imperdiet rhoncus, dapibus vitae arcu.  Nulla non quam erat, luctus consequat nisi.  Integer hendrerit lacus sagittis erat fermentum tincidunt.  Cras vel dui neque.  In sagittis commodo luctus.  Mauris non metus dolor, ut suscipit dui.  Aliquam mauris lacus, laoreet et consequat quis, bibendum id ipsum.  Donec gravida, diam id imperdiet cursus, nunc nisl bibendum sapien, eget tempor neque elit in tortor.',
            `
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit.  Etiam l..." [truncated]
            `,
        );
    });

    it('serializes data inside arrays', () => {
        debrief(
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
        debrief(
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
        debrief(
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
