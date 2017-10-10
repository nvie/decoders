// @flow

import { assertTest } from './asserts';
import type { Decoder } from './types';

const numberDecoder: Decoder<number> = blob => {
    assertTest(blob, Number.isFinite, 'Not a number', 'Expected a finite number');
    return (blob: number);
};

/**
 * Decodes a finite (!) number (integer or float) value.  Will throw
 * a `DecodeError` if anything other than a finite number value is found.  This
 * means that values like `NaN`, or positive and negative `Infinity` are not
 * considered valid numbers.
 */
export function decodeNumber(): Decoder<number> {
    return numberDecoder;
}
