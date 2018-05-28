// @flow strict

import type { Annotation } from 'debrief';
import { Result } from 'lemons';

export type Guard<T> = mixed => T;
export type Predicate<T> = T => boolean;
export type DecodeResult<T> = Result<Annotation, T>;
// $FlowIgnore - deliberately allow `any` here. It's the purpose of decoders!
export type Decoder<T, F = any> = F => DecodeResult<T>;
