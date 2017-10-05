// @flow

import { assertTest, assertType } from './asserts';
import type { Decoder } from './types';

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
    return decodeConstant(null);
}

/**
 * Decodes the undefined value.
 */
export function decodeUndefined(): Decoder<void> {
    return (blob: any) => {
        assertType(blob, 'undefined');
        return undefined;
    };
}
