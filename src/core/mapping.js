// @flow strict

import { annotateObject } from '../annotate';
import { compose, map } from './composition';
import { err, ok } from '../result';
import { merge } from '../annotate';
import { pojo } from './object';
import type { Annotation } from '../annotate';
import type { Decoder } from '../_types';

/**
 * Like mapping(), but returns an object rather than a Map instance.
 */
export function dict<T>(decoder: Decoder<T>): Decoder<{ [string]: T }> {
    return compose(pojo, (blob: { +[key: string]: mixed }) => {
        let rv: { [key: string]: T } = {};
        let errors: { [key: string]: Annotation } | null = null;

        Object.keys(blob).forEach((key: string) => {
            const value = blob[key];
            const result = decoder(value);
            if (result.ok) {
                if (errors === null) {
                    rv[key] = result.value;
                }
            } else {
                rv = {}; // Clear the success value so it can get garbage collected early
                if (errors === null) {
                    errors = {};
                }
                errors[key] = result.error;
            }
        });

        if (errors !== null) {
            return err(merge(annotateObject(blob), errors));
        } else {
            return ok(rv);
        }
    });
}

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
    return map(
        dict(decoder),
        (obj) =>
            new Map(
                // This is effectively Object.entries(obj), but in a way that Flow
                // will know the types are okay
                Object.keys(obj).map((key) => [key, obj[key]]),
            ),
    );
}
