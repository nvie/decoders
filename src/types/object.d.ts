import { $DecoderType, Decoder, OptionalDecoder, Required, Optional } from './types';

export const pojo: Decoder<{[key: string]: unknown}>;
export function object<O extends {[key: string]: Decoder<any>}>(mapping: O): Decoder<
  { [key in keyof Required<O>]: $DecoderType<O[key]> } &
  { [key in keyof Optional<O>]?: $DecoderType<O[key]> }
>;
export function exact<O extends {[key: string]: Decoder<any>}>(mapping: O): Decoder<
  { [key in keyof Required<O>]: $DecoderType<O[key]> } &
  { [key in keyof Optional<O>]?: $DecoderType<O[key]> }
>;
