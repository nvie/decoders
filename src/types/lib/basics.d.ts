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
export function optional<T, C extends Scalar>(decoder: Decoder<T>, defaultValue: (() => C) | C): Decoder<NonNullable<T> | C>; // prettier-ignore
export function optional<T, V>(decoder: Decoder<T>, defaultValue: (() => V) | V): Decoder<NonNullable<T> | V>; // prettier-ignore

/**
 * Accepts whatever the given decoder accepts, or `null`.
 *
 * If a default value is explicitly provided, return that instead in the `null`
 * case.
 */
export function nullable<T>(decoder: Decoder<T>): Decoder<T | null>;
export function nullable<T, C extends Scalar>(decoder: Decoder<T>, defaultValue: (() => C) | C): Decoder<NonNullable<T> | C>; // prettier-ignore
export function nullable<T, V>(decoder: Decoder<T>, defaultValue: (() => V) | V): Decoder<NonNullable<T> | V>; // prettier-ignore

/**
 * Accepts whatever the given decoder accepts, or `null`, or `undefined`.
 *
 * If a default value is explicitly provided, return that instead in the
 * `null`/`undefined` case.
 */
export function maybe<T>(decoder: Decoder<T>): Decoder<T | null | undefined>;
export function maybe<T, C extends Scalar>(decoder: Decoder<T>, defaultValue: (() => C) | C): Decoder<NonNullable<T> | C>; // prettier-ignore
export function maybe<T, V>(decoder: Decoder<T>, defaultValue: (() => V) | V): Decoder<NonNullable<T> | V>; // prettier-ignore

/**
 * Accepts only the given constant value.
 */
export function constant<C extends Scalar>(value: C): Decoder<C>;

/**
 * Accepts anything, completely ignores it, and always returns the provided
 * value instead.
 *
 * This is useful to manually add extra fields to object decoders.
 */
export function always<C extends Scalar>(value: C): Decoder<C>;
export function always<T>(value: (() => T) | T): Decoder<T>;

/**
 * Alias of always.
 */
export function hardcoded<C extends Scalar>(value: C): Decoder<C>;
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
