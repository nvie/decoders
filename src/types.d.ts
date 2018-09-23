import { Annotation } from 'debrief';
import { Result } from 'lemons';

export interface Guard<T> {
  (blob: any): T;
}
export type Predicate<T> = (value: T) => boolean;
export type DecodeResult<T> = Result<Annotation, T>;
export interface Decoder<T, F = any> {
  (blob: F): DecodeResult<T>;
}
