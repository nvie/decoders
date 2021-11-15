// @flow strict

import * as Result from '../Result';
import { constant } from '../constants';
import { dispatch } from '../dispatch';
import { guard } from '../guard';
import { number } from '../number';
import { object } from '../object';
import type { Decoder } from '../types';

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

describe('dispatch', () => {
    const decoder = dispatch('type', { rectangle, circle });

    it('allows conditional decoding', () => {
        const r = { type: 'rectangle', x: 3, y: 5, width: 80, height: 100 };
        expect(guard(decoder)(r)).toEqual(r);

        const c = { type: 'circle', cx: 3, cy: 5, r: 7 };
        expect(Result.unwrap(decoder(c))).toEqual(c);
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
