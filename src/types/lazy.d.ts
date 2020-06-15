import { Decoder } from './types';

export function lazy<T>(decoder: () => Decoder<T>): Decoder<T>;
