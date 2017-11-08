// @flow

import { Ok } from 'lemons';

import { makeErr } from './error';
import type { Decoder } from './types';
import { compose } from './utils';

export const pojo: Decoder<Object> = (blob: any) => {
    return typeof blob === 'object' ? Ok(blob) : makeErr('Must be an object', blob, []);
};

/**
 * A "type function" which informs Flow about how a type will be modified at runtime.
 * Read this as "given a Guard of type T, I can produce a value of type T".  This
 * definition helps construct $ObjMap types.
 */
type UnwrapDecoder = <T>(Decoder<T>) => T;

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
 *   { id: Guard<number>, name: Guard<string> }
 *
 * Passing this to decodeObject() will produce the following return type:
 *
 *   Guard<{ id: number, name: string }>
 *
 * Put simply: it'll "peel off" all of the nested Decoders, puts them together
 * in an object, and wraps it in a Guard<...>.
 */
export function object<O: { [field: string]: Decoder<any> }>(
    mapping: O,
    msg: string = 'Unexpected object shape'
): Decoder<$ObjMap<O, UnwrapDecoder>> {
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
            const decoder = mapping[key];
            const value = blob[key];
            const result = decoder(value);
            try {
                record[key] = result.unwrap();
            } catch (e) {
                return makeErr(msg, blob, [e]);
            }
        }
        return Ok(record);
    });
}

export function field<T>(field: string, decoder: Decoder<T>): Decoder<T> {
    // TODO: Optimize away the many calls to pojo() (one made for each field
    // like this, not efficient -- pull it out of this function)
    return compose(pojo, (blob: Object) => {
        const value = blob[field];
        const result = decoder(value);
        try {
            return Ok(result.unwrap());
        } catch (e) {
            const errText = value === undefined ? `Missing field "${field}"` : `Unexpected value for field "${field}"`;
            return makeErr(errText, blob, [e]);
        }
    });
}
