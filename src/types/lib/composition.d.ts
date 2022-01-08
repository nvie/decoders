import { Decoder } from '../_decoder';

export function prep<T>(
    mapperFn: (blob: unknown) => unknown,
    decoder: Decoder<T>,
): Decoder<T>;
