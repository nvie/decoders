import { Decoder } from './types';

export function nullable<T>(decoder: Decoder<T>): Decoder<T | null>;
