// @flow strict

import * as Result from '../core/Result';
import { guard } from '../guard';
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
        expect(guard(object({ foo: number }))(value)).toEqual({ foo: 42 });
        expect(guard(object({ foo: number, self: mixed }))(value)).toEqual({
            foo: 42,
            self,
        });
        expect(guard(object({ foo: number, self: pojo }))(value)).toEqual({
            foo: 42,
            self,
        });
        expect(
            guard(object({ foo: number, self: object({ foo: number }) }))(value),
        ).toEqual({
            foo: 42,
            self: { foo: 42 },
        });
        expect(
            guard(
                object({
                    foo: number,
                    self: object({
                        foo: number,
                        self: object({ self: object({ foo: number }) }),
                    }),
                }),
            )(value),
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
        expect(Result.isErr(object({ foo: string })(value))).toBe(true);
        expect(Result.isErr(object({ foo: string, self: mixed })(value))).toBe(true);
        expect(Result.isErr(object({ foo: string, self: pojo })(value))).toBe(true);
        expect(
            Result.isErr(object({ foo: number, self: object({ foo: string }) })(value)),
        ).toBe(true);
        expect(
            Result.isErr(
                object({
                    foo: number,
                    self: object({
                        foo: number,
                        self: object({ self: object({ foo: string }) }),
                    }),
                })(value),
            ),
        ).toBe(true);
    });
});
