import { Decoder, Scalar } from '../Decoder';

/**
 * Accepts and returns only the literal `null` value.
 */
export const null_: Decoder<null>;

/**
 * Accepts and returns only the literal `undefined` value.
 */
export const undefined_: Decoder<undefined>;

/**
 * Accepts whatever the given decoder accepts, or `undefined`.
 *
 * If a default value is explicitly provided, return that instead in the
 * `undefined` case.
 */
export function optional<T>(decoder: Decoder<T>): Decoder<T | undefined>;
export function optional<T, V extends Scalar>(
    decoder: Decoder<T>,
    defaultValue: (() => V) | V,
): Decoder<NonNullable<T> | V>;
export function optional<T, V>(
    decoder: Decoder<T>,
    defaultValue: (() => V) | V,
): Decoder<NonNullable<T> | V>;

/**
 * Accepts whatever the given decoder accepts, or `null`.
 *
 * If a default value is explicitly provided, return that instead in the `null`
 * case.
 */
export function nullable<T>(decoder: Decoder<T>): Decoder<T | null>;
export function nullable<T, V extends Scalar>(
    decoder: Decoder<T>,
    defaultValue: (() => V) | V,
): Decoder<NonNullable<T> | V>;
export function nullable<T, V>(
    decoder: Decoder<T>,
    defaultValue: (() => V) | V,
): Decoder<NonNullable<T> | V>;

/**
 * Accepts whatever the given decoder accepts, or `null`, or `undefined`.
 *
 * If a default value is explicitly provided, return that instead in the
 * `null`/`undefined` case.
 */
export function maybe<T>(decoder: Decoder<T>): Decoder<T | null | undefined>;
export function maybe<T, V extends Scalar>(
    decoder: Decoder<T>,
    defaultValue: (() => V) | V,
): Decoder<NonNullable<T> | V>;
export function maybe<T, V>(
    decoder: Decoder<T>,
    defaultValue: (() => V) | V,
): Decoder<NonNullable<T> | V>;

/**
 * Accepts only the given constant value.
 */
export function constant<T extends Scalar>(value: T): Decoder<T>;

/**
 * Accepts anything, completely ignores it, and always returns the provided
 * value instead.
 *
 * This is useful to manually add extra fields to object decoders.
 */
export function always<T extends Scalar>(value: T): Decoder<T>;
export function always<T>(value: (() => T) | T): Decoder<T>;

/**
 * Alias of always.
 */
export function hardcoded<T extends Scalar>(value: T): Decoder<T>;
export function hardcoded<T>(value: (() => T) | T): Decoder<T>;

/**
 * Accepts anything and returns it unchanged.
 *
 * Useful for situation in which you don't know or expect a specific type. Of
 * course, the downside is that you won't know the type of the value statically
 * and you'll have to further refine it yourself.
 */
export const unknown: Decoder<unknown>;

/**
 * Alias of unknown.
 */
export const mixed: Decoder<unknown>;
