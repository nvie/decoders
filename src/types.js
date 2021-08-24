// @flow strict

import type { Annotation } from 'debrief';
import Result from 'lemons/Result';

export type Scalar = string | number | boolean | symbol | void | null;

// NOTE:
// Normally, we should not be discarding Flow warnings about the use of the
// "any" type.  But in the case of decoders, it's the very purpose of the
// library to accept *anything* as input.  To avoid suppressing the "any"
// warnings everywhere throughout this library, we'll suppress it here once,
// and use this re-aliased version of "any" elsewhere.

export type Guard<T> = (mixed) => T;
export type Predicate<T> = (T) => boolean;
export type DecodeResult<T> = Result<Annotation, T>;
export type Decoder<T, F = mixed> = (F) => DecodeResult<T>;

/**
 * A "type function" which informs Flow about how a type will be modified at runtime.
 * Read this as "given a Guard of type T, I can produce a value of type T".  This
 * definition helps construct $ObjMap types.
 */
export type $DecoderType = <T>(Decoder<T>) => T;
export type $GuardType = <T>(Guard<T>) => T;
