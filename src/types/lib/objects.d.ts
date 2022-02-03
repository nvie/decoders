/// <reference lib="es6" />

import { Decoder, DecoderType } from '../Decoder';
import { AllowImplicit } from './_helpers';

export type ObjectDecoderType<T> = AllowImplicit<{
        [key in keyof T]: DecoderType<T[key]>;
}>;

export const pojo: Decoder<{ [key: string]: unknown }>;

export function object<O extends Record<any, never>>(
    mapping: O,
): Decoder<Record<any, never>>;
export function object<O extends { [key: string]: Decoder<any> }>(
    decodersByKey: O,
): Decoder<{ [K in keyof ObjectDecoderType<O>]: ObjectDecoderType<O>[K] }>;
//         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//         This is basically just equivalent to:
//             ObjectDecoderType<O>
//
//         But by "resolving" this with a mapped type, we remove the helper
//         type names from the inferred type here, making this much easier to
//         work with while developing.

export function exact<O extends { [key: string]: Decoder<any> }>(
    decodersByKey: O,
): Decoder<{ [K in keyof ObjectDecoderType<O>]: ObjectDecoderType<O>[K] }>;
//         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//         Ditto (see above)

export function inexact<O extends { [key: string]: Decoder<any> }>(
    decodersByKey: O,
): Decoder<
    { [K in keyof ObjectDecoderType<O>]: ObjectDecoderType<O>[K] } & {
        [extra: string]: unknown;
    }
>;

export function mapping<T>(decoder: Decoder<T>): Decoder<Map<string, T>>;
export function dict<T>(decoder: Decoder<T>): Decoder<{ [key: string]: T }>;
