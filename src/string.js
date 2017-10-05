// @flow

import { assertType } from './asserts';
import type { Decoder } from './types';

/**
 * Decodes a string value.
 * Will throw a DecodeError if anything other than a string value is found.
 */
export function decodeString(): Decoder<string> {
    return (blob: any) => {
        assertType(blob, 'string');
        return (blob: string);
    };
}
