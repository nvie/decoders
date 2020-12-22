// @flow strict

import { oneOf } from './either';
import { either } from './either';
import { number } from './number';
import { object } from './object';
import { string } from './string';
import type { $DecoderType, Decoder } from './types';
import { compose, map } from './utils';

// $FlowFixMe[unclear-type] (not really an issue) - deliberate use of `any` - not sure how we should get rid of this
type anything = any;

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
 *     const shape = dispatch('type', { rectangle, circle })
 *
 * Will be of type Decoder<Rectangle | Circle>.
 *
 * But the dispatch version will typically be more runtime-efficient.  The
 * reason is that it will first do minimal work to "look ahead" into the `type`
 * field here, and based on that value, pick the decoder to invoke.
 *
 * The `either` version will simply try to invoke each decoder, until it finds
 * one that matches.
 *
 * Also, the error messages will be less ambiguous using `dispatch()`.
 */
export function dispatch<O: { +[field: string]: Decoder<anything>, ... }>(
    field: string,
    mapping: O
): Decoder<$Values<$ObjMap<O, $DecoderType>>> {
    const base = object({
        [field]: compose(
            // We are using the "keys" of the mapping object to reconcile
            // the field type. Property names are strings by definition,
            // numbers are automatically converted to strings via toString().
            // For Example below, keys equals ['0'], not [0].
            //
            // const obj = { [0]: 'foo' };
            // const keys = Object.keys(obj);
            //
            // oneOf will fail unless we run toString to the field in
            // the decoded object also.
            //
            map(either(string, number), (value) => value.toString()),
            oneOf(Object.keys(mapping))
        ),
    });
    return (blob: mixed) => {
        return base(blob).andThen((baseObj) => {
            const decoderName = baseObj[field];
            const decoder = mapping[decoderName];
            return decoder(blob);
        });
    };
}
