// @flow strict

import { define } from '../Decoder';
import { either } from './unions';
import type { _Any } from '../_utils';
import type { Decoder, Scalar } from '../Decoder';

/**
 * Accepts and returns only the literal `null` value.
 */
export const null_: Decoder<null> = define((blob, ok, err) =>
    blob === null ? ok(blob) : err('Must be null'),
);

/**
 * Accepts and returns only the literal `undefined` value.
 */
export const undefined_: Decoder<void> = define((blob, ok, err) =>
    blob === undefined ? ok(blob) : err('Must be undefined'),
);

const undefined_or_null: Decoder<null | void> = define((blob, ok, err) =>
    blob === undefined || blob === null
        ? ok(blob)
        : // Combine error message into a single line for readability
          err('Must be undefined or null'),
);

interface Maybeish<E> {
    <T>(decoder: Decoder<T>): Decoder<E | T>;
    <T, V>(
        decoder: Decoder<T>,
        defaultValue: (() => V) | V,
    ): Decoder<$NonMaybeType<T> | V>;
}

function _maybeish<E>(emptyCase: Decoder<E>): Maybeish<E> {
    function _inner(decoder /* defaultValue */) {
        const rv = either(emptyCase, decoder);
        if (
            // If a default value is provided...
            arguments.length >= 2
        ) {
            // ...then return the default value
            const _defaultValue = arguments[1];
            const defaultValue =
                typeof _defaultValue === 'function' ? _defaultValue() : _defaultValue;
            return rv.transform((value) => value ?? defaultValue);
        } else {
            // Otherwise the "normal" empty case
            return rv;
        }
    }

    return (_inner: _Any);
}

/**
 * Accepts whatever the given decoder accepts, or `null`.
 *
 * If a default value is explicitly provided, return that instead in the `null`
 * case.
 */
export const nullable: Maybeish<null> = _maybeish(null_);

/**
 * Accepts whatever the given decoder accepts, or `undefined`.
 *
 * If a default value is explicitly provided, return that instead in the
 * `undefined` case.
 */
export const optional: Maybeish<void> = _maybeish(undefined_);

/**
 * Accepts whatever the given decoder accepts, or `null`, or `undefined`.
 *
 * If a default value is explicitly provided, return that instead in the
 * `null`/`undefined` case.
 */
export const maybe: Maybeish<null | void> = _maybeish(undefined_or_null);

/**
 * Accepts only the given constant value.
 */
export function constant<T: Scalar>(value: T): Decoder<T> {
    return define((blob, ok, err) =>
        blob === value ? ok(value) : err(`Must be constant ${String(value)}`),
    );
}

/**
 * Accepts anything, completely ignores it, and always returns the provided
 * value instead.
 *
 * This is useful to manually add extra fields to object decoders.
 */
export function always<T>(value: (() => T) | T): Decoder<T> {
    return define(
        typeof value === 'function'
            ? (blob /* ignored */, ok, _) =>
                  // $FlowFixMe[incompatible-use]
                  ok(value())
            : (blob /* ignored */, ok, _) => ok(value),
    );
}

/**
 * Alias of always.
 */
export const hardcoded: <T>(T) => Decoder<T> = always;

/**
 * Accepts anything and returns it unchanged.
 *
 * Useful for situation in which you don't know or expect a specific type. Of
 * course, the downside is that you won't know the type of the value statically
 * and you'll have to further refine it yourself.
 */
export const unknown: Decoder<mixed> = define((blob, ok, _) => ok(blob));

/**
 * Alias of unknown.
 */
export const mixed: Decoder<mixed> = unknown;
