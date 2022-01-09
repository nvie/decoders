import { Annotation } from './annotate';
import { Result } from './result';

export type Scalar = string | number | boolean | symbol | undefined | null;

export type Predicate<T> = (value: T) => boolean;

export type DecodeResult<T> = Result<T, Annotation>;
export type DecodeFn<T, I = unknown> = (blob: I) => DecodeResult<T>;

export interface Decoder<T> {
    decode: DecodeFn<T>;
    verify(blob: unknown, formatterFn?: (ann: Annotation) => string): T;
    and<N extends T>(predicate: (value: T) => value is N, msg: string): Decoder<N>;
    and(predicate: (value: T) => boolean, msg: string): Decoder<T>;
    transform<V>(transformFn: (value: T) => V): Decoder<V>;
    describe(message: string): Decoder<T>;
    chain<V>(nextDecodeFn: DecodeFn<V, T>): Decoder<V>;
}

export type DecoderType<T> = T extends Decoder<infer V> ? V : never;

export function define<T>(fn: (blob: unknown) => DecodeResult<T>): Decoder<T>;
