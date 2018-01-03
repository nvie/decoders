// @flow

import { Result } from 'lemons';
import type { Annotation } from 'debrief';

export type Guard<T> = any => T;
export type Predicate<T> = T => boolean;
export type DecodeResult<T> = Result<Annotation<mixed>, T>;
export type Decoder<T, F = any> = F => DecodeResult<T>;
