// @flow

import { Ok, Result } from 'lemons';

import { DecodeError, makeErr } from './asserts';
import type { DecodeErrorType, Decoder, Verifier } from './types';

const DECODER_MARK = Symbol('DECODER_MARK');

/**
 * Will verify that the passed-in arbitrary object indeed is an Object,
 * and return it.  Otherwise throws a runtime error.
 */
export function asObject(blob: any): Object {
    if (typeof blob !== 'object') {
        throw DecodeError('Not an object', 'Expected an object', blob);
    }

    return (blob: Object);
}

export function isDecoderError(error: Error): boolean {
    // $FlowFixMe
    return !!error[DECODER_MARK];
}

export function decoder<T>(verifier: Verifier<T>): Decoder<T> {
    return (blob: any) => verifier(blob).unwrap();
}

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
