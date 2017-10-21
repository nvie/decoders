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
