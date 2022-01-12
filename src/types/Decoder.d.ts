import { Annotation } from './annotate';
import { Result } from './result';

export type Scalar = string | number | boolean | symbol | undefined | null;

export type DecodeResult<T> = Result<T, Annotation>;
export type DecodeFn<T, I = unknown> = (
    blob: I,
    accept: (value: T) => DecodeResult<T>,
    reject: (msg: string | Annotation) => DecodeResult<T>,
) => DecodeResult<T>;

export interface Decoder<T> {
    decode(blob: unknown): DecodeResult<T>;
    verify(blob: unknown, formatterFn?: (ann: Annotation) => string): T;
    and<N extends T>(predicate: (value: T) => value is N, msg: string): Decoder<N>;
    and(predicate: (value: T) => boolean, msg: string): Decoder<T>;
    transform<V>(transformFn: (value: T) => V): Decoder<V>;
    describe(message: string): Decoder<T>;
    then<V>(nextDecodeFn: DecodeFn<V, T>): Decoder<V>;
    peek<V>(nextDecodeFn: DecodeFn<V, [unknown, T]>): Decoder<V>;
}

export type DecoderType<T> = T extends Decoder<infer V> ? V : never;

export function define<T>(fn: DecodeFn<T>): Decoder<T>;
