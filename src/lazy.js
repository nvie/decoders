// @flow strict

import type { Annotation } from 'debrief';
import { annotateFields, isAnnotation } from 'debrief';
import { Err, Ok } from 'lemons/Result';

import { pojo } from './object';
import { number } from './number';
import type { Decoder } from './types';
import { compose, map } from './utils';

/**
 * Given an function returning a Decoder, will use that decoder to decode the
 * value. This is typically used to build decoders for recursive or
 * self-referential types.
 */
export function lazy<T>(decoderFactory: () => Decoder<T>): Decoder<T> {
    return (blob: mixed) => {
        const decoder = decoderFactory();
        return decoder(blob);
    };
}
