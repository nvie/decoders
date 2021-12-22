// @flow strict

import { constant } from '../constants';
import { disjointUnion } from '../dispatch';
import { guard } from '../../_guard';
import { number } from '../number';
import { object } from '../object';
import { string } from '../string';
import { unwrap } from '../../result';
import type { Decoder } from '../../_types';

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

describe('disjointUnion', () => {
    const decoder = disjointUnion('type', { rectangle, circle });

    it('allows conditional decoding', () => {
        const r = { type: 'rectangle', x: 3, y: 5, width: 80, height: 100 };
        expect(guard(decoder)(r)).toEqual(r);

        const c = { type: 'circle', cx: 3, cy: 5, r: 7 };
        expect(unwrap(decoder(c))).toEqual(c);
    });

    it('invalid', () => {
        expect(() => guard(decoder)('foo')).toThrow('Must be an object');
        expect(() => guard(decoder)({})).toThrow('Missing key: "type"');
        expect(() => guard(decoder)({ type: 'blah' })).toThrow(
            /Must be one of.*rectangle.*circle/,
        );
        expect(() => guard(decoder)({ type: 'rectangle', x: 1 })).toThrow(
            /Missing keys: "y", "width", "height"/,
        );
    });
});

describe('disjointUnion with numeric keys', () => {
    const decoder = disjointUnion('type', { [1]: alt1, '2': alt2 });
    //                                      ^^^        ^^^
    //                                      Support both of these syntaxes

    it('allows conditional decoding', () => {
        const a = { type: 1, a: 'hi' };
        expect(guard(decoder)(a)).toEqual(a);

        const b = { type: 2, b: 42 };
        expect(unwrap(decoder(b))).toEqual(b);
    });

    it('invalid', () => {
        expect(() => guard(decoder)('foo')).toThrow('Must be an object');
        expect(() => guard(decoder)({})).toThrow('Missing key: "type"');
        expect(() => guard(decoder)({ type: 'blah' })).toThrow(/Must be one of.*1.*2/);
        expect(() => guard(decoder)({ type: 1, x: 1 })).toThrow(/Missing key: "a"/);
        expect(() => guard(decoder)({ type: 2, x: 1 })).toThrow(/Missing key: "b"/);
    });
});
