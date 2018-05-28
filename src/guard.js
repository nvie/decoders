// @flow strict

import { serialize } from 'debrief';

import type { Decoder, Guard } from './types';

export function guard<T>(decoder: Decoder<T>): Guard<T> {
    return (blob: mixed) =>
        decoder(blob)
            .mapError(annotation => {
                const err = new Error('\n' + serialize(annotation));
                err.name = 'Decoding error';
                return err;
            })
            .unwrap();
}
