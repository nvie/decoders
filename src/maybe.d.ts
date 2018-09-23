import { Decoder } from './types';

export function maybe<T>(decoder: Decoder<T>): Decoder<T | null | undefined>;
