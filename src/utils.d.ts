import { Decoder } from './types';

export function isDate(value: unknown): boolean;
export function map<T, V>(decoder: Decoder<T>, mapper: (item: T) => V): Decoder<V>;
export function compose<T, V>(decoder: Decoder<T>, next: Decoder<V, T>): Decoder<V>;
export function predicate<T>(predicate: (item: T) => boolean, msg: string): Decoder<T>;
