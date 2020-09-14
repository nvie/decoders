// @flow strict

import type { Annotation } from 'debrief';
import { annotateFields, isAnnotation } from 'debrief';
import { Err, Ok } from 'lemons/Result';

import { pojo } from './object';
import type { Decoder } from './types';
import { compose, map } from './utils';

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
    return compose(
        pojo,
        // $FlowFixMe[unclear-type] (not really an issue) - deliberate use of Object here
        (blob: Object) => {
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
        }
    );
}

function mapToObject<T>(mapping: Map<string, T>): { [string]: T } {
    const result: { [string]: T } = { ...null };
    for (const [k, v] of mapping.entries()) {
        result[k] = v;
    }
    return result;
}

/**
 * Like mapping(), but returns an object rather than a Map instance.
 */
export function dict<T>(decoder: Decoder<T>): Decoder<{ [string]: T }> {
    return map(mapping(decoder), mapToObject);
}
