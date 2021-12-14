import { Annotation } from './annotate';
import { Decoder, Guard } from './_types';

export function guard<T>(
    decoder: Decoder<T>,
    formatter?: (Annotation) => string,
): Guard<T>;
