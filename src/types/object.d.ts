import { $DecoderType, Decoder } from './types';
import { AllowImplicit } from './helpers';

export type ObjectDecoderType<T> = AllowImplicit<{
    [key in keyof T]: $DecoderType<T[key]>;
}>;

export const pojo: Decoder<{ [key: string]: unknown }>;

export function object<O extends { [key: string]: Decoder<any> }>(
    mapping: O
): Decoder<{ [K in keyof ObjectDecoderType<O>]: ObjectDecoderType<O>[K] }>;
//         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//         This is basically just equivalent to:
//             ObjectDecoderType<O>
//
//         But by "resolving" this with a mapped type, we remove the helper
//         type names from the inferred type here, making this much easier to
//         work with while developing.

export function exact<O extends { [key: string]: Decoder<any> }>(
    mapping: O
): Decoder<{ [K in keyof ObjectDecoderType<O>]: ObjectDecoderType<O>[K] }>;
//         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//         Ditto (see above)

export function inexact<O extends { [key: string]: Decoder<any> }>(
    mapping: O
): Decoder<
    { [K in keyof ObjectDecoderType<O>]: ObjectDecoderType<O>[K] } & {
        [extra: string]: unknown;
    }
>;
