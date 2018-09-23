import { Decoder } from './types';

export function tuple2<T1, T2>(d1: Decoder<T1>, d2: Decoder<T2>): Decoder<[T1, T2]>;
