import { Annotation } from 'debrief';
import Result from 'lemons/Result';

export type Scalar = string | number | boolean | symbol | undefined | null;

export interface Guard<T> {
    (blob: unknown): T;
}
export type Predicate<T> = (value: T) => boolean;
export type DecodeResult<T> = Result<Annotation, T>;
export interface Decoder<T, F = unknown> {
    (blob: F): DecodeResult<T>;
}

export type DecoderType<T> = T extends Decoder<infer V> ? V : never;
export type $DecoderType<T> = DecoderType<T>; // Alias for backward compatibility

export type GuardType<T> = T extends Guard<infer V> ? V : never;
