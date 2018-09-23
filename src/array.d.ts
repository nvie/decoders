import { Decoder } from './types';

export const poja: Decoder<Array<unknown>>;
export function array<T>(decoder: Decoder<T>): Decoder<Array<T>>;
