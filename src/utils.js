// @flow

import { Ok, Result } from 'lemons';

import { makeErr } from './error';
import DecodeError from './error';
import type { Decoder } from './types';

export function map<T, V>(decoder: Decoder<T>, mapper: T => V): Decoder<V> {
    return compose(decoder, x => Ok(mapper(x)));
}

export function compose<T, V>(decoder: Decoder<T>, next: T => Result<DecodeError, V>): Decoder<V> {
    return (blob: any) => decoder(blob).andThen(next);
}

export function predicate<T>(predicate: T => boolean, msg: string): Decoder<T> {
    return (value: T) => {
        return predicate(value) ? Ok(value) : makeErr(msg, value, []);
    };
}
