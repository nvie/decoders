// @flow

import { Ok, Result } from 'lemons';

import { makeErr } from './asserts';
import type { DecodeErrorType, Guard, Verifier } from './types';

export function map<T, V>(verifier: Verifier<T>, mapper: T => V): Verifier<V> {
    return compose(verifier, x => Ok(mapper(x)));
}

export function compose<T, V>(verifier: Verifier<T>, next: T => Result<DecodeErrorType, V>): Verifier<V> {
    return (blob: any) => verifier(blob).andThen(next);
}

export function predicate<T>(predicate: T => boolean, msg: string): Verifier<T> {
    return (value: T) => {
        return predicate(value) ? Ok(value) : makeErr(msg);
    };
}
