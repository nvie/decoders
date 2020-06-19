import { Decoder } from './types';

export function isDate(value: unknown): boolean;
export function map<T, V>(decoder: Decoder<T>, mapper: (value: T) => V): Decoder<V>;
export function compose<T, V>(decoder: Decoder<T>, next: Decoder<V, T>): Decoder<V>;
export function predicate<T extends F, F = unknown>(
    predicate: (value: F) => value is T,
    msg: string
): Decoder<T, F>;
export function predicate<T>(
    predicate: (value: T) => boolean,
    msg: string
): Decoder<T, T>;
