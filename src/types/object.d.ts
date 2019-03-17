import { $DecoderType, Decoder } from './types';

export const pojo: Decoder<{[key: string]: unknown}>;
export function object<O extends {[key: string]: Decoder<any>}>(mapping: O): Decoder<{
  [key in keyof O]: $DecoderType<O[key]>
}>;
export function exact<O extends {[key: string]: Decoder<any>}>(mapping: O): Decoder<{
  [key in keyof O]: $DecoderType<O[key]>
}>;
export function field<T>(field: string, decoder: Decoder<T>): Decoder<T>;
