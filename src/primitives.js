// @flow

import { assertTest, assertType } from './asserts';
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

/**
 * Decodes a finite (!) number (integer or float) value.
 * Will throw a DecodeError if anything other than a finite number value is
 * found.  This means that, even though values like NaN, or positive and
 * negative infinity are not considered valid numbers.
 */
export function decodeNumber(): Decoder<number> {
    return (blob: any) => {
        assertTest(blob, Number.isFinite, 'Not a number', 'Expected a finite number');
        return (blob: number);
    };
}
