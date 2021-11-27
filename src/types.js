// @flow strict

import type { Annotation } from './core/Annotation';
import type { Result } from './core/Result';

export type Scalar = string | number | boolean | symbol | void | null;

export type Predicate<T> = (T) => boolean;
export type DecodeResult<T> = Result<T, Annotation>;

export type Decoder<T, F = mixed> = (F) => DecodeResult<T>;
export type Guard<T> = (mixed) => T;

/**
 * A "type function" which informs Flow about how a type will be modified at runtime.
 * Read this as "given a Guard of type T, I can produce a value of type T".  This
 * definition helps construct $ObjMap types.
 */
export type DecoderType = <T>(Decoder<T>) => T;
export type GuardType = <T>(Guard<T>) => T;

// Aliases with $-prefixed names for backward-compatibility
export type $DecoderType = DecoderType;
export type $GuardType = GuardType;
