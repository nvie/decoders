import { Annotation } from './annotate';
import { Result } from './result';

export type Scalar = string | number | boolean | symbol | undefined | null;

export type Predicate<T> = (value: T) => boolean;

export type DecodeResult<T> = Result<T, Annotation>;

export interface Decoder<T, F extends unknown = unknown> {
    decoder(blob: F): DecodeResult<T>;
    verify(blob: F, formatterFn?: (ann: Annotation) => string): T;
    and<N extends T>(predicate: (value: T) => value is N, msg: string): Decoder<N, F>;
    and(predicate: (value: T) => boolean, msg: string): Decoder<T, F>;
    transform<V>(transformFn: (value: T) => V): Decoder<V, F>;
    describe(message: string): Decoder<T, F>;
    chain<V>(nextDecodeFn: (blob: T) => DecodeResult<V>): Decoder<V, F>;
}

export function define<T, F extends unknown = unknown>(
    fn: (blob: F) => DecodeResult<T>,
): Decoder<T, F>;

export type DecoderType<T> = T extends Decoder<infer V> ? V : never;
