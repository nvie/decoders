// @flow

import { Ok } from 'lemons';

import { makeErr } from './asserts';
import type { Verifier } from './types';

export const Null: Verifier<null> = (blob: any) => (blob === null ? Ok(blob) : makeErr('Must be null'));

export const Undefined: Verifier<void> = (blob: any) => (blob === undefined ? Ok(blob) : makeErr('Must be undefined'));

export function constant<T>(value: T) {
    return (blob: any) => (blob === value ? Ok(blob) : makeErr(`Must be constant ${(value: any)}`, '', blob));
}

// /**
//  * Decodes any hardcoded value, without looking at the input data.
//  */
// export function decodeValue<T>(value: T): Decoder<T> {
//     return () => {
//         return value;
//     };
// }

// /**
//  * Decodes any constant value.
//  */
// export function decodeConstant<T>(value: T): Decoder<T> {
//     return (blob: any) => {
//         assertTest(
//             blob,
//             blob => blob === value,
//             `Not ${JSON.stringify(value)}`,
//             `Expected the constant value ${JSON.stringify(value)}`
//         );
//         return value;
//     };
// }

// /**
//  * Decodes the null value.
//  */
// export function decodeNull(): Decoder<null> {
//     return nullDecoder;
// }

// /**
//  * Decodes the undefined value.
//  */
// export function decodeUndefined(): Decoder<void> {
//     return undefinedDecoder;
// }
