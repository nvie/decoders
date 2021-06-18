import { Decoder } from './types';

export function describe<T>(decoder: Decoder<T>, msg: string): Decoder<T>;
