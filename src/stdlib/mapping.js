// @flow strict

import * as Result from '../result';
import { annotateObject } from '../annotate';
import { compose, map } from './composition';
import { merge } from '../annotate';
import { pojo } from './object';
import type { Annotation } from '../annotate';
import type { Decoder } from '../_types';

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
    return compose(pojo, (blob: { +[key: string]: mixed }) => {
        let tuples: Array<[string, T]> = [];
        let errors: { [key: string]: Annotation } | null = null;

        Object.keys(blob).forEach((key: string) => {
            const value = blob[key];
            const result = decoder(value);
            if (result.type === 'ok') {
                if (errors === null) {
                    tuples.push([key, result.value]);
                }
            } else {
                tuples.length = 0; // Clear the tuples array
                if (errors === null) {
                    errors = {};
                }
                errors[key] = result.error;
            }
        });

        if (errors !== null) {
            return Result.err(merge(annotateObject(blob), errors));
        } else {
            return Result.ok(new Map(tuples));
        }
    });
}

/**
 * Like mapping(), but returns an object rather than a Map instance.
 */
export function dict<T>(decoder: Decoder<T>): Decoder<{ [string]: T }> {
    return map(mapping(decoder), (m) => Object.fromEntries(m));
}
