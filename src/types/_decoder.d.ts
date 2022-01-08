import { Annotation } from './annotate';
import { Result } from './result';

export type Scalar = string | number | boolean | symbol | undefined | null;

export type Predicate<T> = (value: T) => boolean;

export type DecodeResult<T> = Result<T, Annotation>;

export interface Decoder<T> {
    decoder(blob: unknown): DecodeResult<T>;
    verify(blob: unknown, formatterFn?: (ann: Annotation) => string): T;
    and<N extends T>(predicate: (value: T) => value is N, msg: string): Decoder<N>;
    and(predicate: (value: T) => boolean, msg: string): Decoder<T>;
    transform<V>(transformFn: (value: T) => V): Decoder<V>;
    describe(message: string): Decoder<T>;
    chain<V>(nextDecodeFn: (blob: T) => DecodeResult<V>): Decoder<V>;
}

export function define<T>(fn: (blob: unknown) => DecodeResult<T>): Decoder<T>;

export type DecoderType<T> = T extends Decoder<infer V> ? V : never;
