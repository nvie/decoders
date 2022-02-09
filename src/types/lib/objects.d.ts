/// <reference lib="es6" />

import { Decoder, DecoderType } from '../Decoder';
import { AllowImplicit } from './_helpers';

export type ObjectDecoderType<T> = AllowImplicit<{
    [key in keyof T]: DecoderType<T[key]>;
}>;

/**
 * Accepts any "plain old JavaScript object", but doesn't validate its keys or
 * values further.
 */
export const pojo: Decoder<Record<string, unknown>>;

/**
 * Accepts objects with fields matching the given decoders. Extra fields that
 * exist on the input object are ignored and will not be returned.
 */
export function object(decodersByKey: Record<any, never>): Decoder<Record<string, never>>;
export function object<O extends Record<string, Decoder<any>>>(
    decodersByKey: O,
): Decoder<{ [K in keyof ObjectDecoderType<O>]: ObjectDecoderType<O>[K] }>;
//         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//         This is basically just equivalent to:
//             ObjectDecoderType<O>
//
//         But by "resolving" this with a mapped type, we remove the helper
//         type names from the inferred type here, making this much easier to
//         work with while developing.

/**
 * Like `object()`, but will reject inputs that contain extra fields that are
 * not specified explicitly.
 */
export function exact(decodersByKey: Record<any, never>): Decoder<Record<string, never>>;
export function exact<O extends Record<string, Decoder<any>>>(
    decodersByKey: O,
): Decoder<{ [K in keyof ObjectDecoderType<O>]: ObjectDecoderType<O>[K] }>;
//         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//         Ditto (see above)

/**
 * Like `object()`, but will pass through any extra fields on the input object
 * unvalidated that will thus be of `unknown` type statically.
 */
export function inexact(
    decodersByKey: Record<any, never>,
): Decoder<Record<string, unknown>>;
export function inexact<O extends Record<string, Decoder<any>>>(
    decodersByKey: O,
): Decoder<
    { [K in keyof ObjectDecoderType<O>]: ObjectDecoderType<O>[K] } & Record<
        string,
        unknown
    >
>;

/**
 * Accepts objects where all values match the given decoder, and returns the
 * result as a `Record<string, T>`.
 *
 * The main difference between `object()` and `dict()` is that you'd typically
 * use `object()` if this is a record-like object, where all field names are
 * known and the values are heterogeneous. Whereas with `dict()` the keys are
 * typically dynamic and the values homogeneous, like in a dictionary,
 * a lookup table, or a cache.
 */
export function dict<T>(decoder: Decoder<T>): Decoder<Record<string, T>>;

/**
 * Similar to `dict()`, but returns the result as a `Map<string, T>` (an [ES6
 * Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map))
 * instead.
 */
export function mapping<T>(decoder: Decoder<T>): Decoder<Map<string, T>>;
