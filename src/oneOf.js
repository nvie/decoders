// @flow

import { DecodeError } from './asserts';
import type { Decoder } from './types';

export function oneOf<T1, T2>(alt1: Decoder<T1>, alt2: Decoder<T2>): Decoder<T1 | T2> {
    return (blob: any) => {
        let parents = [];
        for (let decoder of [alt1, alt2]) {
            try {
                return decoder(blob);
            } catch (e) {
                if ('blob' in e) {
                    parents.push(e);
                    continue;
                } else {
                    throw e;
                }
            }
        }

        throw DecodeError(
            'None of the allowed alternatives matched',
            "I've tried to match the following alternatives in order, but none of them could decode the input.",
            blob,
            parents
        );
    };
}

export function oneOf3<T1, T2, T3>(alt1: Decoder<T1>, alt2: Decoder<T2>, alt3: Decoder<T3>): Decoder<T1 | T2 | T3> {
    return oneOf(alt1, oneOf(alt2, alt3));
}

export function oneOf4<T1, T2, T3, T4>(
    alt1: Decoder<T1>,
    alt2: Decoder<T2>,
    alt3: Decoder<T3>,
    alt4: Decoder<T4>
): Decoder<T1 | T2 | T3 | T4> {
    return oneOf(alt1, oneOf3(alt2, alt3, alt4));
}
