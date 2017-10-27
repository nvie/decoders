// @flow

import type { Decoder } from './types';

/**
 * Given a function that takes a base decoder whose value will be passed to
 * a dispatching function that should return another decoder for a detailed
 * branch.  This operation can be thought of as a "union type" but without
 * trying to invoke all of the members one by one.  Instead, there's one
 * decoder that runs first and its result can be passed to a dispatching
 * function that can decide which (sub)decoder to use to verify the input
 * object.  The typical usage of this is to have a base decoder that will look
 * at a specific field of the input object and then decide on which concrete
 * decoder to use.  For example, consider you can distinguish shapes of type
 * "rect" and "circle" based on the value of their "type" field:
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
 *     const shape = dispatch(
 *         field('type', string),
 *         type => {
 *              switch (type) {
 *                  case 'rect': return rectangle;
 *                  case 'circle': return circle;
 *              }
 *              return fail('Must be a valid shape');
 *         }
 *     );
 */
export function dispatch<T, V>(base: Decoder<T>, next: T => Decoder<V>): Decoder<V> {
    return (blob: any) =>
        // We'll dispatch on this value
        base(blob).andThen(value =>
            // Now dispatch on the value by passing in T, and then invoking
            // that decoder on the original input
            next(value)(blob)
        );
}
