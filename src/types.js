// @flow

import { Result } from 'lemons';

export type DecodeErrorType = {
    message: string,
    blob: any,
    parents: Array<DecodeErrorType>,
    format: (prefix?: string) => string,
};

export type Guard<T> = any => T;
export type Predicate<T> = T => boolean;
export type Verifier<T> = any => Result<DecodeErrorType, T>;
