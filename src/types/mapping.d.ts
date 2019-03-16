import { Decoder } from './types';

export function mapping<T>(decoder: Decoder<T>): Decoder<Map<string, T>>;
export function dict<T>(decoder: Decoder<T>): Decoder<{ [key: string]: T }>;
