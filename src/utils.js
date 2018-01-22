// @flow

import { annotate } from 'debrief';
import { Err, Ok } from 'lemons';

import type { Decoder } from './types';

/**
 * This uses duck typing to check whether this is a Date instance.  Since
 * `instanceof` checks are unreliable across stack frames (that information
 * might get lost by the JS runtime), we'll have to reside to either this
 * duck typing, or use something like:
 *
 *     Object.prototype.toString.call(date) === '[object Date]'
 *
 * But in this case, I chose the faster check.
 */
export const isDate = (value: any): boolean => !!value && typeof value.getMonth === 'function';

/**
 * Given a decoder T and a mapping function from T's to V's, returns a decoder
 * for V's.  This is useful to change the original input data.
 */
export function map<T, V>(decoder: Decoder<T>, mapper: T => V): Decoder<V> {
    return compose(decoder, x => Ok(mapper(x)));
}

/**
 * Compose two decoders by passing the result of the first into the second.
 * The second decoder may assume as its input type the output type of the first
 * decoder (so it's not necessary to accept the typical "any").  This is useful
 * for "narrowing down" the checks.  For example, if you want to write
 * a decoder for positive numbers, you can compose it from an existing decoder
 * for any number, and a decoder that, assuming a number, checks if it's
 * positive.  Very often combined with the predicate() helper as the second
 * argument.
 */
export function compose<T, V>(decoder: Decoder<T>, next: Decoder<V, T>): Decoder<V> {
    return (blob: any) => decoder(blob).andThen(next);
}

/**
 * Factory function returning a Decoder<T>, given a predicate function that
 * accepts/rejects the input of type T.
 */
export function predicate<T>(predicate: T => boolean, msg: string): Decoder<T> {
    return (value: T) => {
        return predicate(value) ? Ok(value) : Err(annotate(value, msg));
    };
}
