// @flow

import { DecodeError } from './asserts';
import { decodeNull, decodeUndefined, decodeValue } from './primitives';
import type { Decoder } from './types';

/**
 * A "type function" which informs Flow about how a type will be modified at runtime.
 * Read this as "given a Decoder of type T, I can produce a value of type T".  This
 * definition helps construct $ObjMap types.
 */
type Dedecoder = <T>(decoder: Decoder<T>) => T;

/**
 * Will verify that the passed-in arbitrary object indeed is an Array,
 * and return it.  Otherwise throws a runtime error.
 */
function asArray(blobs: any): Array<any> {
    if (!Array.isArray(blobs)) {
        throw DecodeError('Not an array', 'Expected an array', blobs);
    }

    return (blobs: Array<any>);
}

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
 * Will wrap the given decoder, making it accept null values, too.
 */
export function nullable<T>(decoder: Decoder<T>): Decoder<null | T> {
    return oneOf(decoder, decodeNull());
}

/**
 * Decodes an Array<T> from the given input, given a decoder for type T.
 */
export function decodeArray<T>(itemDecoder: Decoder<T>): Decoder<Array<T>> {
    return (blobs: any) => {
        blobs = asArray(blobs);
        return blobs.map((blob, index) => {
            try {
                return itemDecoder(blob);
            } catch (e) {
                if ('blob' in e) {
                    throw DecodeError(`Unexpected value at index ${index}`, 'See below.', blob, [e]);
                } else {
                    throw e;
                }
            }
        });
    };
}

/**
 * Decodes a 2-tuple of [T, V] from the given input, given decoders for type T and V.
 */
export function decodeTuple2<T, V>(decoderT: Decoder<T>, decoderV: Decoder<V>): Decoder<[T, V]> {
    return (blobs: any) => {
        blobs = asArray(blobs);
        if (blobs.length !== 2) {
            throw DecodeError(
                'Not a 2-tuple',
                `Expected a 2-tuple, but got an array of ${blobs.length} elements`,
                blobs
            );
        }

        const [blob0, blob1] = blobs;

        let t0, t1;

        try {
            t0 = decoderT(blob0);
        } catch (e) {
            if ('blob' in e) {
                throw DecodeError('Unexpected value in 1st tuple position', '', blob0, [e]);
            } else {
                throw e;
            }
        }

        try {
            t1 = decoderV(blob1);
        } catch (e) {
            if ('blob' in e) {
                throw DecodeError('Unexpected value in 2nd tuple position', '', blob1, [e]);
            } else {
                throw e;
            }
        }

        return [t0, t1];
    };
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

export function oneOf<T1, T2>(alt1: Decoder<T1>, alt2: Decoder<T2>): Decoder<T1 | T2> {
    return (blob: any) => {
        let parents = [];
        for (let decoder of [alt1, alt2]) {
            try {
                return decoder(blob);
            } catch (e) {
                if ('blob' in e) {
                    parents.push(e);
                    continue;
                } else {
                    throw e;
                }
            }
        }

        throw DecodeError(
            'None of the allowed alternatives matched',
            "I've tried to match the following alternatives in order, but none of them could decode the input.",
            blob,
            parents
        );
    };
}

export function oneOf3<T1, T2, T3>(alt1: Decoder<T1>, alt2: Decoder<T2>, alt3: Decoder<T3>): Decoder<T1 | T2 | T3> {
    return oneOf(alt1, oneOf(alt2, alt3));
}

export function oneOf4<T1, T2, T3, T4>(
    alt1: Decoder<T1>,
    alt2: Decoder<T2>,
    alt3: Decoder<T3>,
    alt4: Decoder<T4>
): Decoder<T1 | T2 | T3 | T4> {
    return oneOf(oneOf(alt1, alt2), oneOf(alt3, alt4));
}
