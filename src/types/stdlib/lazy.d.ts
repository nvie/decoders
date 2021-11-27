import { Decoder } from '../_types';

export function lazy<T>(decoderFn: () => Decoder<T>): Decoder<T>;
