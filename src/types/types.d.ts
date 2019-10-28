import { Annotation } from 'debrief';
import Result from 'lemons/Result';

export type $DecoderType<T> = (
  T extends OptionalDecoder<infer V> ? V :
    (T extends Decoder<infer V> ? V : never)
);

export interface Guard<T> {
  (blob: unknown): T;
}
export type Predicate<T> = (value: T) => boolean;
export type DecodeResult<T> = Result<Annotation, T>;
export interface Decoder<T, F = unknown> {
  (blob: F): DecodeResult<T>;
}

export type FilterVoid<T extends string | number | symbol, O extends any> = {
  [K in T extends (string | number | symbol)
  ? (O[T] extends (null | undefined) ? never : T)
  : never]: O[K]
};

export type MarkRequired<T, B> = {
  [K in keyof T]: T[K] extends OptionalDecoder<infer D> ?
  (B extends false ? T[K] : never) :
  (B extends true ? T[K] : never)
};

export type Required<T> = FilterVoid<keyof T, MarkRequired<T, true>>;
export type Optional<T> = FilterVoid<keyof T, MarkRequired<T, false>>;

export interface OptionalDecoder<T, F = unknown> extends Decoder<T, F> {
  // This is necessary for Typescript to distinguish between this interface and Decoder
  R: never;
}
