// @flow

import { Ok } from 'lemons';

import { makeErr } from './asserts';
import type { Verifier } from './types';

export function either<T1, T2>(v1: Verifier<T1>, v2: Verifier<T2>): Verifier<T1 | T2> {
    return (blob: any) =>
        v1(blob).dispatch(
            value1 => Ok(value1),
            err1 =>
                v2(blob).dispatch(
                    value2 => Ok(value2),
                    err2 =>
                        makeErr(
                            'None of the allowed alternatives matched',
                            "I've tried to match the following alternatives in order, but none of them could decode the input.",
                            blob,
                            [err1, err2]
                        )
                )
        );
}

export function either3<T1, T2, T3>(v1: Verifier<T1>, v2: Verifier<T2>, v3: Verifier<T3>): Verifier<T1 | T2 | T3> {
    return either(v1, either(v2, v3));
}

export function either4<T1, T2, T3, T4>(
    v1: Verifier<T1>,
    v2: Verifier<T2>,
    v3: Verifier<T3>,
    v4: Verifier<T4>
): Verifier<T1 | T2 | T3 | T4> {
    return either(v1, either3(v2, v3, v4));
}
