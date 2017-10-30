// @flow

import { Result } from 'lemons';

import DecodeError from './error';

export type Guard<T> = any => T;
export type Predicate<T> = T => boolean;
export type Decoder<T> = any => Result<DecodeError, T>;
