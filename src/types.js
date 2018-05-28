// @flow strict

import type { Annotation } from 'debrief';
import { Result } from 'lemons';

// NOTE:
// Normally, we should not be discarding Flow warnings about the use of the
// "any" type.  But in the case of decoders, it's the very purpose of the
// library to accept *anything* as input.  To avoid suppressing the "any"
// warnings everywhere throughout this library, we'll suppress it here once,
// and use this re-aliased version of "any" elsewhere.
//
// $FlowIgnore: decoders take *anything* as input. It's their purpose.
export type anything = any;

export type Guard<T> = anything => T;
export type Predicate<T> = T => boolean;
export type DecodeResult<T> = Result<Annotation, T>;
export type Decoder<T, F = anything> = F => DecodeResult<T>;
