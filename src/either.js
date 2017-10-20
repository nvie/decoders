// @flow

import { Ok } from 'lemons';

import { makeErr } from './asserts';
import type { Verifier } from './types';

export function either<T1, T2>(v1: Verifier<T1>, v2: Verifier<T2>): Verifier<T1 | T2> {
    return (blob: any) => {
        return v1(blob).dispatch(
            value => Ok(value),
            err1 => {
                const r2 = v2(blob);
                return r2.dispatch(
                    value => Ok(value),
                    err2 => makeErr('Error 1:\n' + err1.message + '\n\n' + 'Error 2:\n' + err2.message)
                );
            }
        );
    };
}
