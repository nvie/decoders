import { Decoder } from './types';

// Objects
type UnwrapDecoder<T> = T extends Decoder<infer V> ? V : any;

export const pojo: Decoder<Object>;
export function object<O extends {[key: string]: Decoder<any>}>(mapping: O): Decoder<{
  [key in keyof O]: UnwrapDecoder<O[key]>
}>;
export function exact<O extends {[key: string]: Decoder<any>}>(mapping: O): Decoder<{
  [key in keyof O]: UnwrapDecoder<O[key]>
}>;
export function field<T>(field: string, decoder: Decoder<T>): Decoder<T>;
