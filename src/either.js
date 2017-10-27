// @flow

import { Ok } from 'lemons';

import { makeErr } from './asserts';
import type { Decoder } from './types';

export function either<T1, T2>(d1: Decoder<T1>, d2: Decoder<T2>): Decoder<T1 | T2> {
    return (blob: any) =>
        d1(blob).dispatch(
            value1 => Ok(value1),
            err1 =>
                d2(blob).dispatch(
                    value2 => Ok(value2),
                    err2 =>
                        makeErr(
                            "None of the allowed alternatives matched.  I've tried to match the alternatives in their given order, but none of them could decode the input",
                            blob,
                            [err1, err2]
                        )
                )
        );
}

export function either3<T1, T2, T3>(d1: Decoder<T1>, d2: Decoder<T2>, d3: Decoder<T3>): Decoder<T1 | T2 | T3> {
    return either(d1, either(d2, d3));
}

export function either4<T1, T2, T3, T4>(
    d1: Decoder<T1>,
    d2: Decoder<T2>,
    d3: Decoder<T3>,
    d4: Decoder<T4>
): Decoder<T1 | T2 | T3 | T4> {
    return either(d1, either3(d2, d3, d4));
}
