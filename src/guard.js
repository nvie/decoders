// @flow strict

import { serialize } from 'debrief';

import type { Decoder, Guard, anything } from './types';

export function guard<T>(decoder: Decoder<T>): Guard<T> {
    return (blob: anything) =>
        decoder(blob)
            .mapError(annotation => {
                const err = new Error('\n' + serialize(annotation));
                err.name = 'Decoding error';
                return err;
            })
            .unwrap();
}
