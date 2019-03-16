import { Decoder } from './types';

export function dispatch<T, V>(base: Decoder<T>, next: (value: T) => Decoder<V>): Decoder<V>;
