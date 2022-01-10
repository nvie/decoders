import { Decoder } from '../Decoder';

export function instanceOf<T>(klass: new (...args: readonly any[]) => T): Decoder<T>;
export function lazy<T>(decoderFn: () => Decoder<T>): Decoder<T>;
export function prep<T>(
    mapperFn: (blob: unknown) => unknown,
    decoder: Decoder<T>,
): Decoder<T>;
export function never(msg: string): Decoder<never>;
export function fail(msg: string): Decoder<never>;
