import { Decoder } from './types';

export const poja: Decoder<unknown[]>;
export function array<T>(decoder: Decoder<T>): Decoder<T[]>;
