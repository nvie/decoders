// @flow

import { assertType } from './asserts';
import type { Decoder } from './types';

const booleanDecoder: Decoder<boolean> = blob => {
    assertType(blob, 'boolean');
    return (blob: boolean);
};

/**
 * Decodes a boolean value.
 * Will throw a DecodeError if anything other than a boolean value is found.
 */
export function decodeBoolean(): Decoder<boolean> {
    return booleanDecoder;
}
