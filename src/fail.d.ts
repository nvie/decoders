import { Decoder } from './types';

export function fail<T>(msg: string): Decoder<T>;
