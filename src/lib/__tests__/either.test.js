// @flow strict
/* eslint-disable no-restricted-syntax */

import { boolean } from '../booleans';
import { constant, undefined_ } from '../basics';
import { either, oneOf } from '../either';
import { INPUTS } from './_fixtures';
import { number } from '../numbers';
import { object } from '../objects';
import { partition } from 'itertools';
import { regex, string } from '../strings';

describe('either', () => {
    const stringOrBooleanDecoder = either(string, boolean);
    const [okay, not_okay] = partition(
        INPUTS,
        (x) => typeof x === 'string' || typeof x === 'boolean',
    );

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(stringOrBooleanDecoder.verify(value)).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(() => stringOrBooleanDecoder.verify(value)).toThrow();
        }
    });

    it('errors nicely in trivial eithers', () => {
        expect(() => stringOrBooleanDecoder.verify(42)).toThrow('Either:');
    });

    it('errors nicely in common, simple eithers (ie optional)', () => {
        // Either undefined or string
        const d1 = either(undefined_, string);
        expect(() => d1.verify(42)).toThrow(
            'Either:\n- Must be undefined\n- Must be string',
        );
        expect(() => d1.verify({})).toThrow(
            'Either:\n- Must be undefined\n- Must be string',
        );

        // Either undefined or object
        const d2 = either(undefined_, object({ name: string }));
        expect(() => d2.verify(42)).toThrow(
            'Either:\n- Must be undefined\n- Must be an object',
        );
        expect(() => d2.verify({ name: 42 })).toThrow('Either');

        const d3 = either(regex(/1/, 'Must contain 1'), regex(/2/, 'Must contain 2'));
        expect(() => d3.verify(42)).toThrow('Either');
        expect(() => d3.verify('foobar')).toThrow('Either');
    });

    it('errors in complex eithers (with two wildly different branches)', () => {
        const decoder = either(object({ foo: string }), object({ bar: number }));
        expect(() =>
            decoder.verify({
                foo: 123,
                bar: 'not a number',
            }),
        ).toThrow(
            `{
  "foo": 123,
  "bar": "not a number",
}
^
Either:
- Value at key "foo": Must be string
- Value at key "bar": Must be number`,
        );
    });
});

describe('nested eithers', () => {
    const decoder = either(either(string, boolean), either(number, undefined_));
    expect(() => decoder.verify(null)).toThrow(
        'Either:\n- Must be string\n- Must be boolean\n- Must be number\n- Must be undefined',
    );
});

describe('either fails without decoders', () => {
    expect(() =>
        // $FlowFixMe[incompatible-call] - deliberately invalid call
        either(),
    ).toThrow();
});

describe('either3', () => {
    const decoder = either(string, boolean, number, undefined_);
    const [okay, not_okay] = partition(
        INPUTS,
        (x) =>
            x === undefined ||
            typeof x === 'string' ||
            typeof x === 'boolean' ||
            Number.isFinite(x),
    );

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(decoder.verify(value)).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(() => decoder.verify(value)).toThrow();
        }
    });
});

describe('either9', () => {
    const decoder = either(
        constant('one'),
        constant('two'),
        constant('three'),
        constant('four'),
        constant('five'),
        constant('six'),
        constant('seven'),
        constant('eight'),
        constant('nine'),
    );
    const okay = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const not_okay = INPUTS;

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(decoder.verify(value)).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(decoder.decode(value).ok).toBe(false);
        }
    });
});

describe('oneOf', () => {
    const decoder = oneOf([3, true, null, '1', 'foo']);
    const okay = [3, true, null, '1', 'foo'];
    const not_okay = INPUTS.filter((x) => !okay.includes(x));

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(decoder.verify(value)).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(decoder.decode(value).ok).toBe(false);
        }
    });
});
