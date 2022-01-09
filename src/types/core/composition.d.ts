import { Decoder } from '../_decoder';

export function compose<T, V>(decoder: Decoder<T>, next: Decoder<V, T>): Decoder<V>;
export function prep<T, I>(
    mapperFn: (blob: unknown) => I,
    decoder: Decoder<T, I>,
): Decoder<T>;
