// @flow strict

import { annotate } from '../annotate';
import { define } from '../_decoder';
import { err, ok } from '../result';
import type { Decoder, Scalar } from '../_decoder';

/**
 * Decoder that only returns Ok for `null` inputs.  Err otherwise.
 */
export const null_: Decoder<null> = define((blob) =>
    blob === null ? ok(blob) : err(annotate(blob, 'Must be null')),
);

/**
 * Decoder that only returns Ok for `undefined` inputs.  Err otherwise.
 */
export const undefined_: Decoder<void> = define((blob) =>
    blob === undefined ? ok(blob) : err(annotate(blob, 'Must be undefined')),
);

/**
 * Decoder that only returns Ok for the given value constant.  Err otherwise.
 */
export function constant<T: Scalar>(value: T): Decoder<T> {
    return define((blob) =>
        blob === value
            ? ok(value)
            : err(annotate(blob, `Must be constant ${String(value)}`)),
    );
}

/**
 * Decoder that always returns Ok for the given hardcoded value, no matter what the input.
 */
export function always<T>(value: T): Decoder<T> {
    return define(() => ok(value));
}

/**
 * Alias of always.
 */
export const hardcoded: <T>(T) => Decoder<T> = always;

/**
 * Decoder that always returns Ok for the given hardcoded value, no matter what the input.
 */
export const unknown: Decoder<mixed> = define((blob) => ok(blob));

/**
 * Alias of unknown.
 */
export const mixed: Decoder<mixed> = unknown;
