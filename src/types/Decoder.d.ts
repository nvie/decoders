import { Annotation } from './annotate';
import { Result } from './result';

export type Scalar = string | number | boolean | symbol | undefined | null;

export type DecodeResult<T> = Result<T, Annotation>;

export type AcceptanceFn<T, InputT = unknown> = (
    blob: InputT,
    ok: (value: T) => DecodeResult<T>,
    err: (msg: string | Annotation) => DecodeResult<T>,
) => DecodeResult<T>;

export interface Decoder<T> {
    verify(blob: unknown, formatterFn?: (ann: Annotation) => string | Error): T;
    value(blob: unknown): T | undefined;
    decode(blob: unknown): DecodeResult<T>;
    refine<N extends T>(predicate: (value: T) => value is N, msg: string): Decoder<N>;
    refine(predicate: (value: T) => boolean, msg: string): Decoder<T>;
    reject(rejectFn: (value: T) => string | Annotation | null): Decoder<T>;
    transform<V>(transformFn: (value: T) => V): Decoder<V>;
    describe(message: string): Decoder<T>;
    then<V>(next: AcceptanceFn<V, T>): Decoder<V>;

    // Experimental APIs (please don't rely on these yet)
    peek_UNSTABLE<V>(next: AcceptanceFn<V, [unknown, T]>): Decoder<V>;
}

export type DecoderType<T> = T extends Decoder<infer V> ? V : never;

export function define<T>(fn: AcceptanceFn<T>): Decoder<T>;
