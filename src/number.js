// @flow

import { assertTest } from './asserts';
import type { Decoder } from './types';

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
