// @flow strict

import * as Ann from './debrief/Annotation';
import * as Result from './Result';
import { annotate } from './debrief';
import { compose, map } from './utils';
import { pojo } from './object';
import type { Annotation, ObjectAnnotation } from './debrief/Annotation';
import type { Decoder } from './types';

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
            let errors: Array<[string, Annotation]> = [];

            Object.keys(blob).forEach((key: string) => {
                const value: T = blob[key];
                const result = decoder(value);
                try {
                    const okValue = Result.unwrap(result);
                    if (errors.length === 0) {
                        tuples.push([key, okValue]);
                    }
                } catch (e) {
                    /* istanbul ignore else */
                    const errAnn = Ann.asAnnotation(e);
                    if (errAnn) {
                        tuples.length = 0; // Clear the tuples array
                        errors.push([key, errAnn]);
                    } else {
                        // Otherwise, simply rethrow it
                        /* istanbul ignore next */
                        throw e;
                    }
                }
            });

            if (errors.length > 0) {
                // NOTE: We know `blob` is an object, so the result here will
                // definitely be an ObjectAnnotation. Figure out how to fix
                // this at the Flow level, though.
                // $FlowFixMe[incompatible-type]
                // $FlowFixMe[prop-missing]
                let objAnn: ObjectAnnotation = annotate(blob);
                errors.forEach(([key, errAnn]) => {
                    objAnn = Ann.updateField(objAnn, key, errAnn);
                });
                return Result.err(objAnn);
            } else {
                return Result.ok(new Map(tuples));
            }
        },
    );
}

/**
 * Like mapping(), but returns an object rather than a Map instance.
 */
export function dict<T>(decoder: Decoder<T>): Decoder<{ [string]: T }> {
    return map(mapping(decoder), (m) => Object.fromEntries(m));
}
