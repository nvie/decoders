// @flow strict

import { mixed } from '../constants';
import { guard } from '../guard';
import { number } from '../number';
import { object, pojo } from '../object';
import { string } from '../string';

describe('objects w/ circular refs', () => {
    // Take any decoder and pass in some self-referential object
    const value = { foo: 42 };
    const self = value;
    // $FlowFixMe - let's create a self-referential object
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
            guard(object({ foo: number, self: object({ foo: number }) }))(value)
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
                })
            )(value)
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
        expect(object({ foo: string })(value).isErr()).toBe(true);
        expect(object({ foo: string, self: mixed })(value).isErr()).toBe(true);
        expect(object({ foo: string, self: pojo })(value).isErr()).toBe(true);
        expect(
            object({ foo: number, self: object({ foo: string }) })(value).isErr()
        ).toBe(true);
        expect(
            object({
                foo: number,
                self: object({
                    foo: number,
                    self: object({ self: object({ foo: string }) }),
                }),
            })(value).isErr()
        ).toBe(true);
    });
});
