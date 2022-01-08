import { Annotation } from './annotate';
import { Result } from './result';

export type Scalar = string | number | boolean | symbol | undefined | null;

export type Predicate<T> = (value: T) => boolean;

export type DecodeResult<T> = Result<T, Annotation>;

export interface Decoder<T, F extends unknown = unknown> {
    readonly decoder: (blob: F) => DecodeResult<T>;
    readonly verify: (blob: F, formatterFn?: (ann: Annotation) => string) => T;
}

export function define<T, F extends unknown = unknown>(
    fn: (blob: F) => DecodeResult<T>,
): Decoder<T, F>;

export type DecoderType<T> = T extends Decoder<infer V> ? V : never;
