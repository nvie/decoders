// @flow strict

import { constant } from '../constants';
import { number } from '../number';
import { object } from '../object';
import { string } from '../string';
import { taggedUnion } from '../dispatch';
import type { Decoder } from '../../_decoder';

type Rectangle = {|
    type: 'rectangle',
    x: number,
    y: number,
    width: number,
    height: number,
|};

type Circle = {|
    type: 'circle',
    cx: number,
    cy: number,
    r: number,
|};

const rectangle: Decoder<Rectangle> = object({
    type: constant('rectangle'),
    x: number,
    y: number,
    width: number,
    height: number,
});

const circle: Decoder<Circle> = object({
    type: constant('circle'),
    cx: number,
    cy: number,
    r: number,
});

type Alt1 = {| type: 1, a: string |};
type Alt2 = {| type: 2, b: number |};

const alt1: Decoder<Alt1> = object({ type: constant((1: 1)), a: string });
const alt2: Decoder<Alt2> = object({ type: constant((2: 2)), b: number });

describe('taggedUnion', () => {
    const decoder = taggedUnion('type', { rectangle, circle });

    it('allows conditional decoding', () => {
        const r = { type: 'rectangle', x: 3, y: 5, width: 80, height: 100 };
        expect(decoder.verify(r)).toEqual(r);

        const c = { type: 'circle', cx: 3, cy: 5, r: 7 };
        expect(decoder.verify(c)).toEqual(c);
    });

    it('invalid', () => {
        expect(() => decoder.verify('foo')).toThrow('Must be an object');
        expect(() => decoder.verify({})).toThrow('Missing key: "type"');
        expect(() => decoder.verify({ type: 'blah' })).toThrow(
            /Must be one of.*rectangle.*circle/,
        );
        expect(() => decoder.verify({ type: 'rectangle', x: 1 })).toThrow(
            /Missing keys: "y", "width", "height"/,
        );
    });
});

describe('taggedUnion with numeric keys', () => {
    const decoder = taggedUnion('type', { [1]: alt1, '2': alt2 });
    //                                    ^^^        ^^^
    //                                    Support both of these syntaxes

    it('allows conditional decoding', () => {
        const a = { type: 1, a: 'hi' };
        expect(decoder.verify(a)).toEqual(a);

        const b = { type: 2, b: 42 };
        expect(decoder.verify(b)).toEqual(b);
    });

    it('invalid', () => {
        expect(() => decoder.verify('foo')).toThrow('Must be an object');
        expect(() => decoder.verify({})).toThrow('Missing key: "type"');
        expect(() => decoder.verify({ type: 'blah' })).toThrow(/Must be one of.*1.*2/);
        expect(() => decoder.verify({ type: 1, x: 1 })).toThrow(/Missing key: "a"/);
        expect(() => decoder.verify({ type: 2, x: 1 })).toThrow(/Missing key: "b"/);
    });
});
