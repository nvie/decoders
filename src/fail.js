// @flow

import { DecodeError } from './asserts';
import type { Decoder } from './types';

/**
 * A decoder that will always fail when used.
 */
export function fail<T>(message: string, detail: string): Decoder<T> {
    return (blob: any) => {
        throw DecodeError(message, detail, blob);
    };
}
