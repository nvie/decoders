import { Decoder } from './types';

export function tuple1<T1>(d1: Decoder<T1>): Decoder<[T1]>;
export function tuple2<T1, T2>(d1: Decoder<T1>, d2: Decoder<T2>): Decoder<[T1, T2]>;
export function tuple3<T1, T2, T3>(
    d1: Decoder<T1>,
    d2: Decoder<T2>,
    d3: Decoder<T3>
): Decoder<[T1, T2, T3]>;
export function tuple4<T1, T2, T3, T4>(
    d1: Decoder<T1>,
    d2: Decoder<T2>,
    d3: Decoder<T3>,
    d4: Decoder<T4>
): Decoder<[T1, T2, T3, T4]>;
export function tuple5<T1, T2, T3, T4, T5>(
    d1: Decoder<T1>,
    d2: Decoder<T2>,
    d3: Decoder<T3>,
    d4: Decoder<T4>,
    d5: Decoder<T5>
): Decoder<[T1, T2, T3, T4, T5]>;
export function tuple6<T1, T2, T3, T4, T5, T6>(
    d1: Decoder<T1>,
    d2: Decoder<T2>,
    d3: Decoder<T3>,
    d4: Decoder<T4>,
    d5: Decoder<T5>,
    d6: Decoder<T6>
): Decoder<[T1, T2, T3, T4, T5, T6]>;
