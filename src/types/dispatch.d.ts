import { Decoder, $DecoderType } from './types';

export type $Values<T extends object> = T[keyof T];

export function dispatch<O extends { [key: string]: Decoder<any> }>(
    field: string,
    mapping: O
): Decoder<$Values<{ [key in keyof O]: $DecoderType<O[key]> }>>;
