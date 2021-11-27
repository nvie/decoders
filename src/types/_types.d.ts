import { Annotation } from './annotate';
import { Result } from './result';

export type Scalar = string | number | boolean | symbol | undefined | null;

export interface Guard<T> {
    (blob: unknown): T;
}
export type Predicate<T> = (value: T) => boolean;
export type DecodeResult<T> = Result<T, Annotation>;
export interface Decoder<T, F = unknown> {
    (blob: F): DecodeResult<T>;
}

export type DecoderType<T> = T extends Decoder<infer V> ? V : never;
export type GuardType<T> = T extends Guard<infer V> ? V : never;
