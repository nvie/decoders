import { Decoder, Guard } from './types';

export function guard<T>(decoder: Decoder<T>): Guard<T>;
