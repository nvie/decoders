// @flow

import { andThen } from './andThen';
import { decodeNull, decodeUndefined, decodeValue } from './constants';
import { oneOf, oneOf3 } from './oneOf';
import type { Decoder } from './types';

/**
 * Will wrap the given decoder, making it accept undefined, too.
 */
export function optional<T>(decoder: Decoder<T>, allowNull: boolean = false): Decoder<void | T> {
    if (allowNull) {
        return oneOf3(decoder, decodeUndefined(), andThen(() => decodeValue(undefined), decodeNull()));
    } else {
        return oneOf(decoder, decodeUndefined());
    }
}
