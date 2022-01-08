import { Decoder } from '../_decoder';

export function lazy<T>(decoderFn: () => Decoder<T>): Decoder<T>;
