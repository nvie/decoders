// @flow

import { assertType } from './asserts';
import type { Decoder } from './types';

const stringDecoder: Decoder<string> = blob => {
    assertType(blob, 'string');
    return (blob: string);
};

/**
 * Decodes a string value.
 * Will throw a DecodeError if anything other than a string value is found.
 */
export function decodeString(): Decoder<string> {
    return stringDecoder;
}
