import { Annotation } from './annotate';
import { Decoder, Guard } from './_types';

export function guard<T>(
    decoder: Decoder<T>,
    formatter?: (annotation: Annotation) => string,
): Guard<T>;
