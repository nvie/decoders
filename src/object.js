// @flow strict

import { annotate, annotateFields, isAnnotation } from 'debrief';
import type { Annotation } from 'debrief';
import { Err, Ok } from 'lemons/Result';

import type { $DecoderType, Decoder } from './types';
import { compose, map } from './utils';

// $FlowFixMe[unclear-type] (not really an issue) - deliberate use of `any` - not sure how we should get rid of this
type AnyDecoder = any;

// $FlowFixMe[unclear-type] (not really an issue) - deliberately casting
type cast = any;

function isPojo(o: mixed): boolean %checks {
    return (
        o !== null &&
        o !== undefined &&
        typeof o === 'object' &&
        // This still seems to be the only reliable way to determine whether
        // something is a pojo... ¯\_(ツ)_/¯
        // $FlowFixMe[method-unbinding]
        Object.prototype.toString.call(o) === '[object Object]'
    );
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

export const pojo: Decoder<{| [string]: mixed |}> = (blob: mixed) => {
    return isPojo(blob)
        ? Ok(
              // NOTE:
              // Since Flow 0.98, typeof o === 'object' refines to
              //     {| +[string]: mixed |}
              // instead of
              //     {| [string]: mixed |}
              //
              // For rationale, see https://github.com/facebook/flow/issues/7685.
              // In this case, we don't want to output a read-only version of
              // the object because it's up to the user of decoders to
              // determine what they want to do with the decoded output.  If they
              // want to write items into the array, that's fine!  The fastest
              // way to turn a read-only Object to a writeable one in ES6 seems
              // to be to use object-spread. (Going off this benchmark:
              // https://thecodebarbarian.com/object-assign-vs-object-spread.html)
              { ...blob }
          )
        : Err(annotate(blob, 'Must be an object'));
};

/**
 * Given a mapping of fields-to-decoders, builds a decoder for an object type.
 *
 * For example, given decoders for a number and a string, we can construct an
 * "object description" like so:
 *
 *   { id: number, name: string }
 *
 * Which is of type:
 *
 *   { id: Decoder<number>, name: Decoder<string> }
 *
 * Passing this to object() will produce the following return type:
 *
 *   Decoder<{ id: number, name: string }>
 *
 * Put simply: it'll "peel off" all of the nested Decoders, puts them together
 * in an object, and wraps it in a Decoder<...>.
 */
export function object<O: { +[field: string]: AnyDecoder, ... }>(
    mapping: O
): Decoder<$ObjMap<O, $DecoderType>> {
    const known = new Set(Object.keys(mapping));
    return compose(pojo, (blob: {| [string]: mixed |}) => {
        const actual = new Set(Object.keys(blob));

        // At this point, "missing" will also include all fields that may
        // validly be optional.  We'll let the underlying decoder decide and
        // remove the key from this missing set if the decoder accepts the
        // value.
        const missing = subtract(known, actual);

        let record = {};
        const fieldErrors: { [key: string]: Annotation } = { ...null };

        // NOTE: We're using .keys() here over .entries(), since .entries()
        // will type the value part as "mixed"
        for (const key of Object.keys(mapping)) {
            const decoder = mapping[key];
            const rawValue = blob[key];
            const result = decoder(rawValue);
            try {
                const value = result.unwrap();
                if (value !== undefined) {
                    record[key] = value;
                }

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
                if (rawValue === undefined) {
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
            let err;

            if (fieldsWithErrors.length > 0) {
                const errorlist = fieldsWithErrors.map((k) => [k, fieldErrors[k]]);
                err = annotateFields(blob, errorlist);
            } else {
                err = annotate(blob);
            }

            if (missing.size > 0) {
                const errMsg = Array.from(missing)
                    .map((key) => `"${key}"`)
                    .join(', ');
                const pluralized = missing.size > 1 ? 'keys' : 'key';
                err = annotate(err, `Missing ${pluralized}: ${errMsg}`);
            }

            return Err(err);
        }

        return Ok(record);
    });
}

export function exact<O: { +[field: string]: AnyDecoder, ... }>(
    mapping: O
): Decoder<$ObjMap<$Exact<O>, $DecoderType>> {
    // Check the inputted object for any superfluous keys
    const allowed = new Set(Object.keys(mapping));
    const checked = compose(pojo, (blob: {| [string]: mixed |}) => {
        const actual = new Set(Object.keys(blob));
        const superfluous = subtract(actual, allowed);
        if (superfluous.size > 0) {
            return Err(
                annotate(blob, `Superfluous keys: ${Array.from(superfluous).join(', ')}`)
            );
        }
        return Ok(blob);
    });

    // Defer to the "object" decoder for doing the real decoding work.  Since
    // we made sure there are no superfluous keys in this structure, it's now
    // safe to force-cast it to an $Exact<> type.
    const decoder = ((object(mapping): cast): Decoder<$ObjMap<$Exact<O>, $DecoderType>>);
    return compose(checked, decoder);
}

export function inexact<O: { +[field: string]: AnyDecoder }>(
    mapping: O
): Decoder<$ObjMap<O, $DecoderType> & { +[string]: mixed }> {
    return compose(pojo, (blob: {| [string]: mixed |}) => {
        const allkeys = new Set(Object.keys(blob));
        const decoder = map(object(mapping), (safepart: $ObjMap<O, $DecoderType>) => {
            const safekeys = new Set(Object.keys(mapping));

            // To account for hard-coded keys that aren't part of the input
            for (const k of safekeys) {
                allkeys.add(k);
            }

            const rv = {};
            for (const k of allkeys) {
                if (safekeys.has(k)) {
                    const value = safepart[k];
                    if (value !== undefined) {
                        rv[k] = value;
                    }
                } else {
                    rv[k] = blob[k];
                }
            }
            return rv;
        });
        return decoder(blob);
    });
}
