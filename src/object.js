// @flow

import { annotate, annotateFields, isAnnotation } from 'debrief';
import type { Annotation } from 'debrief';
import { Err, Ok } from 'lemons';

import type { Decoder } from './types';
import { compose, isDate } from './utils';

// Helper to indicate we're deliberately using "any", telling Flow we know what
// we're doing
type cast = any;

function isObject(o: any): boolean %checks {
    return o !== null && typeof o === 'object' && !Array.isArray(o) && !isDate(o);
}

function subtract(xs: Set<string>, ys: Set<string>): Set<string> {
    const result = new Set();
    for (const x of xs) {
        if (!ys.has(x)) {
            result.add(x);
        }
    }
    return result;
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
export function object<O: { [field: string]: Decoder<any> }>(mapping: O): Decoder<$ObjMap<O, UnwrapDecoder>> {
    const known = new Set(Object.keys(mapping));
    return compose(pojo, (blob: Object) => {
        const actual = new Set(Object.keys(blob));

        // At this point, "missing" will also include all fields that may
        // validly be optional.  We'll let the underlying decoder decide and
        // remove the key from this missing set if the decoder accepts the
        // value.
        const missing = subtract(known, actual);

        let record = {};
        const fieldErrors: { [key: string]: Annotation } = {};

        // NOTE: We're using .keys() here over .entries(), since .entries()
        // will type the value part as "mixed"
        for (const key of Object.keys(mapping)) {
            const decoder = mapping[key];
            const value = blob[key];
            const result = decoder(value);
            try {
                record[key] = result.unwrap();

                // If this succeeded, remove the key from the missing keys
                // tracker
                missing.delete(key);
            } catch (ann) {
                /* istanbul ignore next */
                if (!isAnnotation(ann)) {
                    throw ann;
                }

                // Keep track of the annotation, but don't return just yet. We
                // want to collect more error information.
                if (value === undefined) {
                    // Explicitly add it to the missing set if the value is
                    // undefined.  This covers explicit undefineds to be
                    // treated the same as implicit undefineds (aka missing
                    // keys).
                    missing.add(key);
                } else {
                    fieldErrors[key] = ann;
                }
            }
        }

        // Deal with errors now. There are two classes of errors we want to
        // report.  First of all, we want to report any inline errors in this
        // object.  Lastly, any fields that are missing should be annotated on
        // the outer object itself.
        const fieldsWithErrors = Object.keys(fieldErrors);
        if (fieldsWithErrors.length > 0 || missing.size > 0) {
            let err = blob;

            if (fieldsWithErrors.length > 0) {
                const errorlist = fieldsWithErrors.map(k => [k, fieldErrors[k]]);
                err = annotateFields(err, errorlist);
            }

            if (missing.size > 0) {
                const errMsg = [...missing].map(key => `"${key}"`).join(', ');
                const pluralized = missing.size > 1 ? 'keys' : 'key';
                err = annotate(err, `Missing ${pluralized}: ${errMsg}`);
            }

            return Err(err);
        }

        return Ok(record);
    });
}

export function exact<O: { [field: string]: Decoder<any> }>(mapping: O): Decoder<$Exact<$ObjMap<O, UnwrapDecoder>>> {
    // Check the inputted object for any superfluous keys
    const allowed = new Set(Object.keys(mapping));
    const checked = compose(pojo, (blob: Object) => {
        const actual = new Set(Object.keys(blob));
        const superfluous = subtract(actual, allowed);
        if (superfluous.size > 0) {
            return Err(annotate(blob, `Superfluous keys: ${[...superfluous].join(', ')}`));
        }
        return Ok(blob);
    });

    // Defer to the "object" decoder for doing the real decoding work.  Since
    // we made sure there are no superfluous keys in this structure, it's now
    // safe to force-case it to an $Exact<> type.
    const decoder = ((object(mapping): cast): Decoder<$Exact<$ObjMap<O, UnwrapDecoder>>>);
    return compose(checked, decoder);
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
            const errText = value === undefined ? `Missing key: "${field}"` : `Unexpected value for field "${field}"`;
            return Err(annotate(blob, errText));
        }
    });
}
