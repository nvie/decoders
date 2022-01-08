// @flow strict

import { mixed } from '../constants';
import { number } from '../number';
import { object, pojo } from '../object';
import { string } from '../string';

describe('objects w/ circular refs', () => {
    // Take any decoder and pass in some self-referential object
    const value = { foo: 42 };
    const self = value;
    // $FlowFixMe[prop-missing] - let's create a self-referential object
    value.self = self;
    it('valid', () => {
        expect(object({ foo: number }).verify(value)).toEqual({ foo: 42 });
        expect(object({ foo: number, self: mixed }).verify(value)).toEqual({
            foo: 42,
            self,
        });
        expect(object({ foo: number, self: pojo }).verify(value)).toEqual({
            foo: 42,
            self,
        });
        expect(
            object({ foo: number, self: object({ foo: number }) }).verify(value),
        ).toEqual({
            foo: 42,
            self: { foo: 42 },
        });
        expect(
            object({
                foo: number,
                self: object({
                    foo: number,
                    self: object({ self: object({ foo: number }) }),
                }),
            }).verify(value),
        ).toEqual({
            foo: 42,
            self: {
                foo: 42,
                self: {
                    self: {
                        foo: 42,
                    },
                },
            },
        });
    });

    it('invalid', () => {
        expect(object({ foo: string }).decode(value).ok).toBe(false);
        expect(object({ foo: string, self: mixed }).decode(value).ok).toBe(false);
        expect(object({ foo: string, self: pojo }).decode(value).ok).toBe(false);
        expect(
            object({ foo: number, self: object({ foo: string }) }).decode(value).ok,
        ).toBe(false);
        expect(
            object({
                foo: number,
                self: object({
                    foo: number,
                    self: object({ self: object({ foo: string }) }),
                }),
            }).decode(value).ok,
        ).toBe(false);
    });
});
