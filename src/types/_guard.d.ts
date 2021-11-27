import { Decoder, Guard } from './_types';

export interface Options {
    style?: 'inline' | 'simple';
}

export function guard<T>(decoder: Decoder<T>, options?: Options): Guard<T>;
