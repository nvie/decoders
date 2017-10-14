// @flow

import type { ResultT } from './Result';

export type Decoder<T> = any => T;
export type JSType = 'string' | 'number' | 'boolean' | 'object' | 'undefined';
export type Predicate<T> = T => boolean;
export type Verifier<T> = any => ResultT<T>;
