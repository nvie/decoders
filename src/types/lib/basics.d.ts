import { Decoder, Scalar } from '../Decoder';

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
