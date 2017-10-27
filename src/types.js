// @flow

import { Result } from 'lemons';

export type DecodeErrorType = {
    message: string,
    blob: mixed,
    parents: Array<DecodeErrorType>,
    format: (prefix?: string) => string,
};

export type Guard<T> = any => T;
export type Predicate<T> = T => boolean;
export type Decoder<T> = any => Result<DecodeErrorType, T>;
