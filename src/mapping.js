// @flow

import type { Annotation } from 'debrief';
import { annotateFields, isAnnotation } from 'debrief';
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
        let errors: Array<[string, string | Annotation]> = [];

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
                    errors.push([key, e]);
                } else {
                    // Otherwise, simply rethrow it
                    /* istanbul ignore next */
                    throw e;
                }
            }
        });

        if (errors.length > 0) {
            return Err(annotateFields(blob, errors));
        } else {
            return Ok(new Map(tuples));
        }
    });
}
