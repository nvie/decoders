import { Decoder, Guard } from './types';

type Options = {
    style?: 'inline' | 'simple', // `inline` by default
};

export function guard<T>(decoder: Decoder<T>, options?: Options): Guard<T>;
