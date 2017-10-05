// @flow

import { DecodeError } from './asserts';
import type { Decoder } from './types';
import { asObject } from './utils';

/**
 * A "type function" which informs Flow about how a type will be modified at runtime.
 * Read this as "given a Decoder of type T, I can produce a value of type T".  This
 * definition helps construct $ObjMap types.
 */
type Dedecoder = <T>(decoder: Decoder<T>) => T;

/**
 * Given a mapping of fields-to-decoders, builds a decoder for an object type.
 *
 * For example, given decoders for a number and a string, we can construct an
 * "object description" like so:
 *
 *   { id: decodeNumber(), name: decodeString() }
 *
 * Which is of type:
 *
 *   { id: Decoder<number>, name: Decoder<string> }
 *
 * Passing this to decodeObject() will produce the following return type:
 *
 *   Decoder<{ id: number, name: string }>
 *
 * Put simply: it'll "peel off" all of the nested Decoders, puts them together
 * in an object, and wraps it in a Decoder<...>.
 */
export function decodeObject<O: { [field: string]: Decoder<any> }>(mapping: O): Decoder<$ObjMap<O, Dedecoder>> {
    return (blob: any) => {
        // Verify that blob actually _is_ a POJO and it has all the fields
        blob = asObject(blob);

        let result = {};
        Object.keys(mapping).forEach(key => {
            const decoder = mapping[key];
            const value = blob[key];
            try {
                result[key] = decoder(value);
            } catch (e) {
                if ('blob' in e) {
                    throw DecodeError(
                        'Unexpected object shape',
                        `Expected object to have "${key}" field matching its expected type`,
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

export function decodeField<T>(field: string, decoder: Decoder<T>): Decoder<T> {
    return (blob: any) => {
        // Verify that blob actually _is_ a POJO and it has all the fields
        blob = asObject(blob);

        const value = blob[field];
        try {
            return decoder(value);
        } catch (e) {
            if ('blob' in e) {
                throw DecodeError(
                    `Unexpected field value for field "${field}"`,
                    `Expected object to have "${field}" field matching its expected type`,
                    blob,
                    [e]
                );
            } else {
                throw e;
            }
        }
    };
}
