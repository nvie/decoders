// @flow

import { assertType } from './asserts';
import type { Decoder } from './types';

/**
 * Decodes a boolean value.
 * Will throw a DecodeError if anything other than a boolean value is found.
 */
export function decodeBoolean(): Decoder<boolean> {
    return (blob: any) => {
        assertType(blob, 'boolean');
        return (blob: boolean);
    };
}
