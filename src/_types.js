// @flow strict

import type { Annotation } from './annotate';
import type { Result } from './result';

export type Scalar = string | number | boolean | symbol | void | null;

export type Predicate<T> = (T) => boolean;
export type DecodeResult<T> = Result<T, Annotation>;

export type Decoder<T, F = mixed> = (F) => DecodeResult<T>;
export type Guard<T> = (mixed) => T;

/**
 * Returns the output type of a Decoder<T>; in other words: T.
 */
export type DecoderType = <T>(Decoder<T>) => T;
export type GuardType = <T>(Guard<T>) => T;
