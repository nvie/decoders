// @flow

import { DecodeError, assertTest, assertType } from './asserts';
import type { Decoder } from './types';

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
 * Decodes the undefined value.
 */
export function decodeUndefined(): Decoder<void> {
    return (blob: any) => {
        assertType(blob, 'undefined');
        return undefined;
    };
}

/**
 * Decodes the null value.
 */
export function decodeNull(): Decoder<null> {
    return decodeConstant(null);
}

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

/**
 * A decoder that will always fail when used.
 */
export function fail<T>(message: string, detail: string): Decoder<T> {
    return (blob: any) => {
        throw DecodeError(message, detail, blob);
    };
}
