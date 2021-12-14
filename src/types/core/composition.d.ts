import { Decoder } from '../_types';

export function map<T, V>(decoder: Decoder<T>, mapper: (value: T) => V): Decoder<V>;
export function compose<T, V>(decoder: Decoder<T>, next: Decoder<V, T>): Decoder<V>;
export function predicate<T>(
    predicate: (value: T) => boolean,
    msg: string,
): Decoder<T, T>;
