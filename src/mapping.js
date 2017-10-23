// @flow

import { Ok } from 'lemons';

import { makeErr } from './asserts';
import { pojo } from './object';
import type { Verifier } from './types';
import { compose } from './utils';

/**
 * Given an object, will decode a Map of string keys to whatever values.
 *
 * For example, given a verifier for a Person, we can verify a Person lookup
 * table structure (of type Map<string, Person>) like so:
 *
 *   mapping(person)
 *
 */
export function mapping<T>(verifier: Verifier<T>): Verifier<Map<string, T>> {
    return compose(pojo, (blob: Object) => {
        try {
            return Ok(
                new Map(
                    Object.keys(blob).map((key: string) => {
                        const value: T = blob[key];
                        return [key, verifier(value).unwrap()];
                    })
                )
            );
        } catch (e) {
            return makeErr('Unexpected value', '', blob, [e]);
        }
    });
}
