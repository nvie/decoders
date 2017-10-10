// @flow

import { assertTest, assertType } from './asserts';
import type { Decoder } from './types';

const nullDecoder: Decoder<null> = decodeConstant(null);
const undefinedDecoder: Decoder<void> = blob => {
    assertType(blob, 'undefined');
    return undefined;
};

/**
 * Decodes any hardcoded value, without looking at the input data.
 */
export function decodeValue<T>(value: T): Decoder<T> {
    return () => {
        return value;
    };
}

/**
 * Decodes any constant value.
 */
export function decodeConstant<T>(value: T): Decoder<T> {
    return (blob: any) => {
        assertTest(
            blob,
            blob => blob === value,
            `Not ${JSON.stringify(value)}`,
            `Expected the constant value ${JSON.stringify(value)}`
        );
        return value;
    };
}

/**
 * Decodes the null value.
 */
export function decodeNull(): Decoder<null> {
    return nullDecoder;
}

/**
 * Decodes the undefined value.
 */
export function decodeUndefined(): Decoder<void> {
    return undefinedDecoder;
}
