// @flow strict

import * as Result from './result';
import { formatInline } from './format';
import type { Annotation } from './annotate';
import type { Decoder, Guard } from './_types';

export function guard<T>(
    decoder: Decoder<T>,
    formatter: (Annotation) => string = formatInline,
): Guard<T> {
    return (blob: mixed) =>
        Result.unwrap(
            Result.mapError(decoder(blob), (annotation) => {
                const err = new Error('\n' + formatter(annotation));
                err.name = 'Decoding error';
                return err;
            }),
        );
}
