// @flow strict

import { annotate } from '../annotate';
import { define } from '../_decoder';
import { either } from './either';
import { err, ok } from '../result';
import type { Decoder, Scalar } from '../_decoder';

/**
 * Accepts and returns only the literal `null` value.
 */
export const null_: Decoder<null> = define((blob) =>
    blob === null ? ok(blob) : err(annotate(blob, 'Must be null')),
);

/**
 * Accepts and returns only the literal `undefined` value.
 */
export const undefined_: Decoder<void> = define((blob) =>
    blob === undefined ? ok(blob) : err(annotate(blob, 'Must be undefined')),
);

/**
 * Accepts whatever the given decoder accepts, or `undefined`.
 */
export function optional<T>(decoder: Decoder<T>): Decoder<void | T> {
    return either(undefined_, decoder);
}

/**
 * Accepts whatever the given decoder accepts, or `null`.
 */
export function nullable<T>(decoder: Decoder<T>): Decoder<null | T> {
    return either(null_, decoder);
}

const undefined_or_null: Decoder<null | void> = define((blob) =>
    blob === undefined || blob === null
        ? ok(blob)
        : // Combine error message into a single line for readability
          err(annotate(blob, 'Must be undefined or null')),
);

/**
 * Accepts whatever the given decoder accepts, or `null`, or `undefined`.
 */
export function maybe<T>(decoder: Decoder<T>): Decoder<T | null | void> {
    return either(undefined_or_null, decoder);
}

/**
 * Accepts only the given constant value.
 */
export function constant<T: Scalar>(value: T): Decoder<T> {
    return define((blob) =>
        blob === value
            ? ok(value)
            : err(annotate(blob, `Must be constant ${String(value)}`)),
    );
}

/**
 * Accepts anything, completely ignores it, and always returns the provided
 * value instead.
 *
 * This is useful to manually add extra fields to object decoders.
 */
export function always<T>(value: T): Decoder<T> {
    return define(() => ok(value));
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
export const unknown: Decoder<mixed> = define((blob) => ok(blob));

/**
 * Alias of unknown.
 */
export const mixed: Decoder<mixed> = unknown;
