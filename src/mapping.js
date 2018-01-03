// @flow

import type { Annotation } from 'debrief';
import { annotate, isAnnotation } from 'debrief';
import { Err, Ok } from 'lemons';

import { pojo } from './object';
import type { Decoder } from './types';
import { compose } from './utils';

/**
 * Given an object, will decode a Map of string keys to whatever values.
 *
 * For example, given a decoder for a Person, we can verify a Person lookup
 * table structure (of type Map<string, Person>) like so:
 *
 *   mapping(person)
 *
 */
export function mapping<T>(decoder: Decoder<T>): Decoder<Map<string, T>> {
    return compose(pojo, (blob: Object) => {
        let tuples: Array<[string, T]> = [];
        let errors: Array<[string, Annotation<mixed>]> = [];

        Object.keys(blob).forEach((key: string) => {
            const value: T = blob[key];
            const result = decoder(value);
            try {
                const okValue = result.unwrap();
                if (errors.length === 0) {
                    tuples.push([key, okValue]);
                }
            } catch (e) {
                /* istanbul ignore else */
                if (isAnnotation(e)) {
                    tuples.length = 0; // Clear the tuples array
                    errors.push([key, ((e: any): Annotation<mixed>)]);
                } else {
                    // Otherwise, simply rethrow it
                    /* istanbul ignore next */
                    throw e;
                }
            }
        });

        if (errors.length > 0) {
            let keys = errors.map(([key]) => key);
            keys.sort();
            keys = keys.map(s => `"${s}"`); // quote keys
            return Err(annotate(blob, 'TODO: FIXME')); // `Unexpected value under keys ${keys.join(', ')}`, blob, errors.map(([, e]) => e));
        } else {
            return Ok(new Map(tuples));
        }
    });
}
