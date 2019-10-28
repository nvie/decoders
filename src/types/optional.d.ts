import { Decoder, OptionalDecoder } from './types';

export function optional<T>(decoder: Decoder<T>): OptionalDecoder<T>;
export function nullable<T>(decoder: Decoder<T>): Decoder<T | null>;
export function maybe<T>(decoder: Decoder<T>): OptionalDecoder<T | null>;
