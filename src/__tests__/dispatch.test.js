// @flow

import { constant } from '../constants';
import { dispatch } from '../dispatch';
import { fail } from '../fail';
import { number } from '../number';
import { field, object } from '../object';
import { string } from '../string';

const rectangle = object(
    {
        type: constant('rect'),
        x: number,
        y: number,
        width: number,
        height: number,
    },
    'Must be rectangle'
);

const circle = object(
    {
        type: constant('circle'),
        x: number,
        y: number,
        r: number,
    },
    'Must be circle'
);

describe('dispatch', () => {
    // The "deciderer" ;) effectively dispatches the real decoding to
    // a specific decoder, after detecting the value of the type field.
    const decoder = dispatch(field('type', string), type => {
        switch (type) {
            case 'rect':
                return rectangle;
            case 'circle':
                return circle;
        }
        return fail('Must be a valid shape');
    });

    it('allows conditional decoding', () => {
        const r = { type: 'rect', x: 3, y: 5, width: 80, height: 100 };
        expect(decoder(r).unwrap()).toEqual(r);

        const c = { type: 'circle', x: 3, y: 5, r: 7 };
        expect(decoder(c).unwrap()).toEqual(c);
    });

    it('invalid', () => {
        expect(() => decoder('foo').unwrap()).toThrow('Must be an object');
        expect(() => decoder({}).unwrap()).toThrow('Missing field "type"');
        expect(() => decoder({ type: 'blah' }).unwrap()).toThrow('Must be a valid shape');
        expect(() => decoder({ type: 'rect' }).unwrap()).toThrow('Must be rectangle');
    });
});
