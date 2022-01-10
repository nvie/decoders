import { Decoder, DecoderType, Scalar } from '../_decoder';

export type Values<T extends object> = T[keyof T];

export type DecoderTypes<T> = T extends ReadonlyArray<Decoder<infer U>> ? U : never;

export function either<T extends ReadonlyArray<Decoder<any>>>(
    ...args: T
): Decoder<DecoderTypes<T>>;
// export function either<T1, T2>(d1: Decoder<T1>, d2: Decoder<T2>): Decoder<T1 | T2>;
// export function either2<T1, T2>(d1: Decoder<T1>, d2: Decoder<T2>): Decoder<T1 | T2>;
// export function either3<T1, T2, T3>(
//     d1: Decoder<T1>,
//     d2: Decoder<T2>,
//     d3: Decoder<T3>,
// ): Decoder<T1 | T2 | T3>;
// export function either4<T1, T2, T3, T4>(
//     d1: Decoder<T1>,
//     d2: Decoder<T2>,
//     d3: Decoder<T3>,
//     d4: Decoder<T4>,
// ): Decoder<T1 | T2 | T3 | T4>;
// export function either5<T1, T2, T3, T4, T5>(
//     d1: Decoder<T1>,
//     d2: Decoder<T2>,
//     d3: Decoder<T3>,
//     d4: Decoder<T4>,
//     d5: Decoder<T5>,
// ): Decoder<T1 | T2 | T3 | T4 | T5>;
// export function either6<T1, T2, T3, T4, T5, T6>(
//     d1: Decoder<T1>,
//     d2: Decoder<T2>,
//     d3: Decoder<T3>,
//     d4: Decoder<T4>,
//     d5: Decoder<T5>,
//     d6: Decoder<T6>,
// ): Decoder<T1 | T2 | T3 | T4 | T5 | T6>;
// export function either7<T1, T2, T3, T4, T5, T6, T7>(
//     d1: Decoder<T1>,
//     d2: Decoder<T2>,
//     d3: Decoder<T3>,
//     d4: Decoder<T4>,
//     d5: Decoder<T5>,
//     d6: Decoder<T6>,
//     d7: Decoder<T7>,
// ): Decoder<T1 | T2 | T3 | T4 | T5 | T6 | T7>;
// export function either8<T1, T2, T3, T4, T5, T6, T7, T8>(
//     d1: Decoder<T1>,
//     d2: Decoder<T2>,
//     d3: Decoder<T3>,
//     d4: Decoder<T4>,
//     d5: Decoder<T5>,
//     d6: Decoder<T6>,
//     d7: Decoder<T7>,
//     d8: Decoder<T8>,
// ): Decoder<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8>;
// export function either9<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
//     d1: Decoder<T1>,
//     d2: Decoder<T2>,
//     d3: Decoder<T3>,
//     d4: Decoder<T4>,
//     d5: Decoder<T5>,
//     d6: Decoder<T6>,
//     d7: Decoder<T7>,
//     d8: Decoder<T8>,
//     d9: Decoder<T9>,
// ): Decoder<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>;
export function oneOf<T extends Scalar>(constants: readonly T[]): Decoder<T>;

export function taggedUnion<O extends { [key: string]: Decoder<any> }>(
    field: string,
    mapping: O,
): Decoder<Values<{ [key in keyof O]: DecoderType<O[key]> }>>;

export function dispatch<O extends { [key: string]: Decoder<any> }>(
    field: string,
    mapping: O,
): Decoder<Values<{ [key in keyof O]: DecoderType<O[key]> }>>;
