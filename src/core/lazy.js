// @flow strict

import { define } from '../_decoder';
import type { Decoder } from '../_decoder';

/**
 * Given an function returning a Decoder, will use that decoder to decode the
 * value. This is typically used to build decoders for recursive or
 * self-referential types.
 */
export function lazy<T>(decoderFn: () => Decoder<T>): Decoder<T> {
    return define((blob) => decoderFn().decode(blob));
}
