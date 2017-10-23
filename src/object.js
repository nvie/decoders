// @flow

import { Ok } from 'lemons';

import { makeErr } from './asserts';
import type { Verifier } from './types';
import { compose } from './utils';

// TODO: rename pojo => object
// TODO: rename object => record
export const pojo: Verifier<Object> = (blob: any) => {
    return typeof blob === 'object' ? Ok(blob) : makeErr('Must be an object', '', blob);
};

/**
 * A "type function" which informs Flow about how a type will be modified at runtime.
 * Read this as "given a Decoder of type T, I can produce a value of type T".  This
 * definition helps construct $ObjMap types.
 */
type UnwrapVerifier = <T>(Verifier<T>) => T;

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
export function object<O: { [field: string]: Verifier<any> }>(
    mapping: O,
    msg: string = 'Unexpected object shape'
): Verifier<$ObjMap<O, UnwrapVerifier>> {
    return compose(pojo, (blob: Object) => {
        //
        // TODO:
        // Work on better error messages, like:
        // missing keys 'id' and 'name' (report them all at once, don't even
        // invoke nested verifiers before all required keys are present)
        //

        let record = {};

        // NOTE: We're using .keys() here over .entries(), since .entries()
        // will type the value part as "mixed"for (const key of Object.keys(mapping)) {
        for (const key of Object.keys(mapping)) {
            const verifier = mapping[key];
            const value = blob[key];
            const result = verifier(value);
            try {
                record[key] = result.unwrap();
            } catch (e) {
                return makeErr(msg, `Expected object to have "${key}" field matching its expected type`, blob, [e]);
            }
        }
        return Ok(record);
    });
}

export function field<T>(field: string, verifier: Verifier<T>): Verifier<T> {
    // TODO: Optimize away the many calls to pojo() (one made for each field
    // like this, not efficient -- pull it out of this function)
    return compose(pojo, (blob: Object) => {
        const value = blob[field];
        const result = verifier(value);
        try {
            return Ok(result.unwrap());
        } catch (e) {
            const errText = value === undefined ? `Missing field "${field}"` : `Unexpected value for field "${field}"`;
            return makeErr(errText, `Expected object to have "${field}" field matching its expected type`, blob, [e]);
        }
    });
}
