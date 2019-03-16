import { Decoder } from './types';

export function optional<T>(decoder: Decoder<T>): Decoder<T | undefined>;
