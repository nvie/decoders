// @flow

import { DecodeError } from './asserts';
import type { Decoder } from './types';
import { asObject } from './utils';

/**
 * Given a JSON object, will decode a Map of string keys to whatever values.
 *
 * For example, given a decoder for a Person, we can decode a Person lookup table
 * structure (of type Map<string, Person>) like so:
 *
 *   decodeMap(decodePerson())
 *
 */
export function decodeMap<T>(decoder: Decoder<T>): Decoder<Map<string, T>> {
    return (blob: any) => {
        // Verify that blob actually _is_ a POJO and it has all the fields
        blob = asObject(blob);

        let result = new Map();
        Object.entries(blob).forEach(([id: string, value: mixed]) => {
            try {
                result.set(id, decoder(value));
            } catch (e) {
                if ('blob' in e) {
                    throw DecodeError(
                        'Unexpected value',
                        `Expected value under key "${id}" to match its expected type`,
                        blob,
                        [e]
                    );
                } else {
                    throw e;
                }
            }
        });
        return result;
    };
}
