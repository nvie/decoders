// @flow

import { DecodeError } from './asserts';
import { decodeNull, decodeUndefined } from './constants';
import { oneOf, oneOf3 } from './oneOf';
import type { Decoder } from './types';
import { decodeValue } from './value';

/**
 * A "type function" which informs Flow about how a type will be modified at runtime.
 * Read this as "given a Decoder of type T, I can produce a value of type T".  This
 * definition helps construct $ObjMap types.
 */
type Dedecoder = <T>(decoder: Decoder<T>) => T;

/**
 * Will verify that the passed-in arbitrary object indeed is an Object,
 * and return it.  Otherwise throws a runtime error.
 */
function asObject(blob: any): Object {
    if (typeof blob !== 'object') {
        throw DecodeError('Not an object', 'Expected an object', blob);
    }

    return (blob: Object);
}

/**
 * Create a decoder that, when decoding A works, will allow you to generate a decoder B on
 * the fly, based on the parsed-out value of A, then continue feeding that decoder the
 * original blob.
 */
export function andThen<A, B>(decoderFactory: A => Decoder<B>, decoder: Decoder<A>): Decoder<B> {
    return (blob: any) => {
        let valueA = decoder(blob);
        let decoderB = decoderFactory(valueA);
        return decoderB(blob);
    };
}

/**
 * Will wrap the given decoder, making it accept undefined, too.
 */
export function optional<T>(decoder: Decoder<T>, allowNull: boolean = false): Decoder<void | T> {
    if (allowNull) {
        return oneOf3(decoder, decodeUndefined(), andThen(() => decodeValue(undefined), decodeNull()));
    } else {
        return oneOf(decoder, decodeUndefined());
    }
}

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
