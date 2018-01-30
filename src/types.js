// @flow

import type { Annotation } from 'debrief';
import { Result } from 'lemons';

export type Guard<T> = any => T;
export type Predicate<T> = T => boolean;
export type DecodeResult<T> = Result<Annotation, T>;
export type Decoder<T, F = any> = F => DecodeResult<T>;
