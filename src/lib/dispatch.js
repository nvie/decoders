// @flow strict

import { andThen } from '../result';
import { define } from '../_decoder';
import { object } from './objects';
import { oneOf } from './either';
import { prep } from './utilities';
import type { _Any } from '../_utils';
import type { Decoder } from '../_decoder';

/**
 * Dispatches to one of several given decoders, based on the value found at
 * runtime in the given field.  For example, suppose you have these decoders:
 *
 *     const rectangle = object({
 *         type: constant('rect'),
 *         x: number,
 *         y: number,
 *         width: number,
 *         height: number,
 *     });
 *
 *     const circle = object({
 *         type: constant('circle'),
 *         cx: number,
 *         cy: number,
 *         r: number,
 *      });
 *
 * Then these two decoders are equivalent:
 *
 *     const shape = either(rectangle, circle)
 *     const shape = taggedUnion('type', { rectangle, circle })
 *
 * Will be of type Decoder<Rectangle | Circle>.
 *
 * But `taggedUnion` will typically be more runtime-efficient.  The reason is
 * that it will first do minimal work to "look ahead" into the `type` field
 * here, and based on that value, pick the decoder to invoke.
 *
 * The `either` version will simply try to invoke each decoder, until it finds
 * one that matches.
 *
 * Also, the error messages will be less ambiguous using `taggedUnion()`.
 */
export function taggedUnion<O: { +[field: string]: Decoder<_Any>, ... }>(
    field: string,
    mapping: O,
): Decoder<$Values<$ObjMap<O, <T>(Decoder<T>) => T>>> {
    const base = object({
        [field]: prep(String, oneOf(Object.keys(mapping))),
    });
    return define((blob) => {
        return andThen(base.decode(blob), (baseObj) => {
            const decoderName = baseObj[field];
            const decoder = mapping[decoderName];
            return decoder.decode(blob);
        });
    });
}
