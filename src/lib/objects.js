// @flow strict

import { annotate, annotateObject, merge, updateText } from '../annotate';
import { define } from '../_decoder';
import { err, ok } from '../result';
import type { _Any } from '../_utils';
import type { Annotation } from '../annotate';
import type { Decoder, DecodeResult } from '../_decoder';

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
    xs.forEach((x) => {
        if (!ys.has(x)) {
            result.add(x);
        }
    });
    return result;
}

export const pojo: Decoder<{| [string]: mixed |}> = define((blob) =>
    isPojo(blob)
        ? ok(
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
              { ...blob },
          )
        : err(annotate(blob, 'Must be an object')),
);

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
export function object<O: { +[field: string]: Decoder<_Any>, ... }>(
    mapping: O,
): Decoder<$ObjMap<O, <T>(Decoder<T>) => T>> {
    const known = new Set(Object.keys(mapping));
    return pojo.chain((blob) => {
        const actual = new Set(Object.keys(blob));

        // At this point, "missing" will also include all fields that may
        // validly be optional.  We'll let the underlying decoder decide and
        // remove the key from this missing set if the decoder accepts the
        // value.
        const missing = subtract(known, actual);

        let record = {};
        let errors: { [key: string]: Annotation } | null = null;

        Object.keys(mapping).forEach((key) => {
            const decoder = mapping[key];
            const rawValue = blob[key];
            const result: DecodeResult<mixed> = decoder.decode(rawValue);

            if (result.ok) {
                const value = result.value;
                if (value !== undefined) {
                    record[key] = value;
                }

                // If this succeeded, remove the key from the missing keys
                // tracker
                missing.delete(key);
            } else {
                const ann = result.error;

                // Keep track of the annotation, but don't return just yet. We
                // want to collect more error information.
                if (rawValue === undefined) {
                    // Explicitly add it to the missing set if the value is
                    // undefined.  This covers explicit undefineds to be
                    // treated the same as implicit undefineds (aka missing
                    // keys).
                    missing.add(key);
                } else {
                    if (errors === null) {
                        errors = {};
                    }
                    errors[key] = ann;
                }
            }
        });

        // Deal with errors now. There are two classes of errors we want to
        // report.  First of all, we want to report any inline errors in this
        // object.  Lastly, any fields that are missing should be annotated on
        // the outer object itself.
        if (errors || missing.size > 0) {
            let objAnn = annotateObject(blob);

            if (errors) {
                objAnn = merge(objAnn, errors);
            }

            if (missing.size > 0) {
                const errMsg = Array.from(missing)
                    .map((key) => `"${key}"`)
                    .join(', ');
                const pluralized = missing.size > 1 ? 'keys' : 'key';
                objAnn = updateText(objAnn, `Missing ${pluralized}: ${errMsg}`);
            }

            return err(objAnn);
        }

        return ok(record);
    });
}

export function exact<O: { +[field: string]: Decoder<_Any>, ... }>(
    mapping: O,
): Decoder<$ObjMap<$Exact<O>, <T>(Decoder<T>) => T>> {
    // Check the inputted object for any superfluous keys
    const allowed = new Set(Object.keys(mapping));
    const checked = pojo.chain((blob) => {
        const actual = new Set(Object.keys(blob));
        const superfluous = subtract(actual, allowed);
        if (superfluous.size > 0) {
            return err(
                annotate(blob, `Superfluous keys: ${Array.from(superfluous).join(', ')}`),
            );
        }
        return ok(blob);
    });

    // Defer to the "object" decoder for doing the real decoding work.  Since
    // we made sure there are no superfluous keys in this structure, it's now
    // safe to force-cast it to an $Exact<> type.
    // prettier-ignore
    const decoder = ((object(mapping): _Any): Decoder<$ObjMap<$Exact<O>, <T>(Decoder<T>) => T>>);
    return checked.chain(decoder.decode);
}

export function inexact<O: { +[field: string]: Decoder<_Any> }>(
    mapping: O,
): Decoder<$ObjMap<O, <T>(Decoder<T>) => T> & { +[string]: mixed }> {
    return pojo.chain((blob) => {
        const allkeys = new Set(Object.keys(blob));
        const decoder = object(mapping).transform(
            (safepart: $ObjMap<O, <T>(Decoder<T>) => T>) => {
                const safekeys = new Set(Object.keys(mapping));

                // To account for hard-coded keys that aren't part of the input
                safekeys.forEach((k) => allkeys.add(k));

                const rv = {};
                allkeys.forEach((k) => {
                    if (safekeys.has(k)) {
                        const value = safepart[k];
                        if (value !== undefined) {
                            rv[k] = value;
                        }
                    } else {
                        rv[k] = blob[k];
                    }
                });
                return rv;
            },
        );
        return decoder.decode(blob);
    });
}

/**
 * Like mapping(), but returns an object rather than a Map instance.
 */
export function dict<T>(decoder: Decoder<T>): Decoder<{ [string]: T }> {
    return pojo.chain((blob) => {
        let rv: { [key: string]: T } = {};
        let errors: { [key: string]: Annotation } | null = null;

        Object.keys(blob).forEach((key: string) => {
            const value = blob[key];
            const result = decoder.decode(value);
            if (result.ok) {
                if (errors === null) {
                    rv[key] = result.value;
                }
            } else {
                rv = {}; // Clear the success value so it can get garbage collected early
                if (errors === null) {
                    errors = {};
                }
                errors[key] = result.error;
            }
        });

        if (errors !== null) {
            return err(merge(annotateObject(blob), errors));
        } else {
            return ok(rv);
        }
    });
}

/**
 * Given an object, will decode a Map of string keys to whatever values.
 *
 * For example, given a decoder for a Person, we can verify a Person lookup
 * table structure (of type Map<string, Person>) like so:
 *
 *   mapping(person)
 *
 */
export function mapping<T>(decoder: Decoder<T>): Decoder<Map<string, T>> {
    return dict(decoder).transform(
        (obj) =>
            new Map(
                // This is effectively Object.entries(obj), but in a way that Flow
                // will know the types are okay
                Object.keys(obj).map((key) => [key, obj[key]]),
            ),
    );
}