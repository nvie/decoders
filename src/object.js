// @flow

import { annotate, annotateField, isAnnotation } from 'debrief';
import { Err, Ok } from 'lemons';

import type { Decoder } from './types';
import { compose } from './utils';

function isObject(o: any): boolean %checks {
    return o !== null && typeof o === 'object';
}

export const pojo: Decoder<Object> = (blob: any) => {
    return isObject(blob) ? Ok(blob) : Err(annotate(blob, 'Must be an object'));
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
    msg: string = 'DEPRECATED'
): Decoder<$ObjMap<O, UnwrapDecoder>> {
    /* istanbul ignore next */
    if (msg !== 'DEPRECATED') {
        // eslint-disable-next-line
        console.log("warning: `msg` param to `object({}, 'my msg')` will be deprecated in a future version");
    }

    return compose(pojo, (blob: Object) => {
        //
        // TODO:
        // Work on better error messages, like:
        // missing keys 'id' and 'name' (report them all at once, don't even
        // invoke nested verifiers before all required keys are present)
        //

        let record = {};

        // NOTE: We're using .keys() here over .entries(), since .entries()
        // will type the value part as "mixed"
        for (const key of Object.keys(mapping)) {
            const decoder = mapping[key];
            const value = blob[key];
            const result = decoder(value);
            try {
                record[key] = result.unwrap();
            } catch (ann) {
                /* istanbul ignore next */
                if (!isAnnotation(ann)) {
                    throw ann;
                }

                const missing = value === undefined;
                if (missing) {
                    return Err(annotate(blob, `Missing key "${key}"`));
                } else {
                    return Err(annotateField(blob, key, ann));
                }
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
            return Err(annotate(blob, errText));
        }
    });
}
