// @flow strict

import { constant } from '../constants';
import { disjointUnion } from '../dispatch';
import { guard } from '../../_guard';
import { number } from '../number';
import { object } from '../object';
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
