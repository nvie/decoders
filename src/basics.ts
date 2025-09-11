import type { Decoder } from '~/core';
import { define } from '~/core';
import { quote } from '~/lib/text';
import type { Scalar } from '~/lib/types';

import { either } from './unions';

function lazyval<V>(value: (() => V) | V): V {
  return typeof value === 'function' ? (value as () => V)() : value;
}

/**
 * Accepts and returns only the literal `null` value.
 */
export const null_ = constant(null);

/**
 * Accepts and returns only the literal `undefined` value.
 */
export const undefined_ = constant(undefined);

const nullish_: Decoder<null | undefined> = define((blob, ok, err) =>
  // Equiv to either(undefined_, null_), but combined for better error message
  blob == null ? ok(blob) : err('Must be undefined or null'),
);

/**
 * Accepts whatever the given decoder accepts, or `undefined`.
 *
 * If a default value is explicitly provided, return that instead in the
 * `undefined` case.
 */
export function optional<T>(decoder: Decoder<T>): Decoder<T | undefined>;
export function optional<T, C extends Scalar>(decoder: Decoder<T>, defaultValue: (() => C) | C): Decoder<NonNullable<T> | C>; // prettier-ignore
export function optional<T, V>(decoder: Decoder<T>, defaultValue: (() => V) | V): Decoder<NonNullable<T> | V>; // prettier-ignore
export function optional<T, V>(
  decoder: Decoder<T>,
  defaultValue?: (() => V) | V,
): Decoder<T | V | undefined> {
  const rv = define<T | undefined>((blob, ok) =>
    blob === undefined ? ok(undefined) : decoder.decode(blob),
  );
  return arguments.length >= 2
    ? rv.transform((value) => value ?? lazyval(defaultValue as (() => V) | V))
    : rv;
}

/**
 * Accepts whatever the given decoder accepts, or `null`.
 *
 * If a default value is explicitly provided, return that instead in the `null`
 * case.
 */
export function nullable<T>(decoder: Decoder<T>): Decoder<T | null>;
export function nullable<T, C extends Scalar>(decoder: Decoder<T>, defaultValue: (() => C) | C): Decoder<NonNullable<T> | C>; // prettier-ignore
export function nullable<T, V>(decoder: Decoder<T>, defaultValue: (() => V) | V): Decoder<NonNullable<T> | V>; // prettier-ignore
export function nullable<T, V>(
  decoder: Decoder<T>,
  defaultValue?: (() => V) | V,
): Decoder<T | V | null> {
  const rv = either(null_, decoder);
  return arguments.length >= 2
    ? rv.transform((value) => value ?? lazyval(defaultValue as (() => V) | V))
    : rv;
}

/**
 * @deprecated Will get removed in a future version.
 *
 * Alias of `nullish()`.
 */
export const maybe = nullish;

/**
 * Accepts whatever the given decoder accepts, or `null`, or `undefined`.
 *
 * If a default value is explicitly provided, return that instead in the
 * `null`/`undefined` case.
 */
export function nullish<T>(decoder: Decoder<T>): Decoder<T | null | undefined>;
export function nullish<T, C extends Scalar>(decoder: Decoder<T>, defaultValue: (() => C) | C): Decoder<NonNullable<T> | C>; // prettier-ignore
export function nullish<T, V>(decoder: Decoder<T>, defaultValue: (() => V) | V): Decoder<NonNullable<T> | V>; // prettier-ignore
export function nullish<T, V>(
  decoder: Decoder<T>,
  defaultValue?: (() => V) | V,
): Decoder<T | V | null | undefined> {
  const rv = either(nullish_, decoder);
  return arguments.length >= 2
    ? rv.transform((value) => value ?? lazyval(defaultValue as (() => V) | V))
    : rv;
}

/**
 * Accepts only the given constant value.
 */
export function constant<C extends Scalar>(value: C): Decoder<C> {
  return define((blob, ok, err) =>
    blob === value
      ? ok(value)
      : err(`Must be ${typeof value === 'symbol' ? String(value) : quote(value)}`),
  );
}

/**
 * Accepts anything, completely ignores it, and always returns the provided
 * value instead.
 *
 * This is useful to manually add extra fields to object decoders.
 */
export function always<C extends Scalar>(value: C): Decoder<C>;
export function always<T>(value: (() => T) | T): Decoder<T>;
export function always<T>(value: (() => T) | T): Decoder<T> {
  return define(
    typeof value === 'function'
      ? (_, ok) => ok((value as () => T)())
      : (_, ok) => ok(value),
  );
}

/**
 * Rejects all inputs, and always fails with the given error message. May be
 * useful for explicitly disallowing keys, or for testing purposes.
 */
export function never(msg: string): Decoder<never> {
  return define((_, __, err) => err(msg));
}

/**
 * Alias of `never()`.
 */
export const fail = never;

/**
 * Alias of `always()`.
 *
 * @deprecated Will get removed in a future version.
 */
export const hardcoded = always;

/**
 * Accepts anything and returns it unchanged.
 *
 * Useful for situation in which you don't know or expect a specific type. Of
 * course, the downside is that you won't know the type of the value statically
 * and you'll have to further refine it yourself.
 */
export const unknown: Decoder<unknown> = define((blob, ok, _) => ok(blob));

/**
 * Alias of `unknown`.
 *
 * @deprecated Will get removed in a future version.
 */
export const mixed = unknown;
