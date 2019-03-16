import { Decoder, Guard } from './types';

export interface Options {
    style?: 'inline' | 'simple';
}

export function guard<T>(decoder: Decoder<T>, options?: Options): Guard<T>;
