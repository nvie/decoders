// @flow

import { constant } from '../constants';
import { dispatch } from '../dispatch';
import { number } from '../number';
import { field, object } from '../object';
import { string } from '../string';
import { fail } from '../fail';

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
    // a specific verifier, after detecting the value of the type field.
    const verifier = dispatch(field('type', string), type => {
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
        expect(verifier(r).unwrap()).toEqual(r);

        const c = { type: 'circle', x: 3, y: 5, r: 7 };
        expect(verifier(c).unwrap()).toEqual(c);
    });

    it('invalid', () => {
        expect(() => verifier('foo').unwrap()).toThrow('Must be an object');
        expect(() => verifier({}).unwrap()).toThrow('Missing field "type"');
        expect(() => verifier({ type: 'blah' }).unwrap()).toThrow('Must be a valid shape');
        expect(() => verifier({ type: 'rect' }).unwrap()).toThrow('Must be rectangle');
    });
});
