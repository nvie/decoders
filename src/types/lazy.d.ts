import { Decoder } from './types';

export function lazy<T>(decoderFn: () => Decoder<T>): Decoder<T>;
