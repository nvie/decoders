import { Decoder, DecoderType, Scalar } from '../Decoder';

export type Values<T extends object> = T[keyof T];

export type DecoderTypes<T> = T extends ReadonlyArray<Decoder<infer U>> ? U : never;

export function either<T extends ReadonlyArray<Decoder<any>>>(
    ...args: T
): Decoder<DecoderTypes<T>>;
export function oneOf<T extends Scalar>(constants: readonly T[]): Decoder<T>;

export function taggedUnion<O extends { [key: string]: Decoder<any> }>(
    field: string,
    mapping: O,
): Decoder<Values<{ [key in keyof O]: DecoderType<O[key]> }>>;
