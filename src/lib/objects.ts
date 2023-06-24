// @flow strict

import { annotateObject, merge, updateText } from '../annotate';
import { define } from '../Decoder';
import { subtract } from '../_utils';
import type { Annotation } from '../annotate';
import type { _Any as AnyDecoder } from '../_utils';
import type { Decoder, DecodeResult } from '../Decoder';

/**
 * Accepts any "plain old JavaScript object", but doesn't validate its keys or
 * values further.
 */
export const pojo: Decoder<{| [string]: mixed |}> = define((blob, ok, err) =>
    blob !== null &&
    blob !== undefined &&
    typeof blob === 'object' &&
    // This still seems to be the only reliable way to determine whether
    // something is a pojo... ¯\_(ツ)_/¯
    // $FlowFixMe[method-unbinding]
    Object.prototype.toString.call(blob) === '[object Object]'
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
              // $FlowFixMe[incompatible-variance]
              blob,
          )
        : err('Must be an object'),
);

/**
 * Accepts objects with fields matching the given decoders. Extra fields that
 * exist on the input object are ignored and will not be returned.
 */
export function object<O: { +[field: string]: AnyDecoder, ... }>(
    decodersByKey: O,
): Decoder<$ObjMap<O, <T>(Decoder<T>) => T>> {
    // Compute this set at decoder definition time
    const knownKeys = new Set(Object.keys(decodersByKey));

    return pojo.then((plainObj, ok, err) => {
        const actualKeys = new Set(Object.keys(plainObj));

        // At this point, "missingKeys" will also include all fields that may
        // validly be optional. We'll let the underlying decoder decide and
        // remove the key from this missing set if the decoder accepts the
        // value.
        const missingKeys = subtract(knownKeys, actualKeys);

        let record = {};
        let errors: { [key: string]: Annotation } | null = null;

        Object.keys(decodersByKey).forEach((key) => {
            const decoder = decodersByKey[key];
            const rawValue = plainObj[key];
            const result: DecodeResult<mixed> = decoder.decode(rawValue);

            if (result.ok) {
                const value = result.value;
                if (value !== undefined) {
                    record[key] = value;
                }

                // If this succeeded, remove the key from the missing keys
                // tracker
                missingKeys.delete(key);
            } else {
                const ann = result.error;

                // Keep track of the annotation, but don't return just yet. We
                // want to collect more error information.
                if (rawValue === undefined) {
                    // Explicitly add it to the missing set if the value is
                    // undefined.  This covers explicit undefineds to be
                    // treated the same as implicit undefineds (aka missing
                    // keys).
                    missingKeys.add(key);
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
        if (errors || missingKeys.size > 0) {
            let objAnn = annotateObject(plainObj);

            if (errors) {
                objAnn = merge(objAnn, errors);
            }

            if (missingKeys.size > 0) {
                const errMsg = Array.from(missingKeys)
                    .map((key) => `"${key}"`)
                    .join(', ');
                const pluralized = missingKeys.size > 1 ? 'keys' : 'key';
                objAnn = updateText(objAnn, `Missing ${pluralized}: ${errMsg}`);
            }

            return err(objAnn);
        }

        return ok(record);
    });
}

/**
 * Like `object()`, but will reject inputs that contain extra fields that are
 * not specified explicitly.
 */
export function exact<O: { +[field: string]: AnyDecoder, ... }>(
    decodersByKey: O,
): Decoder<$ObjMap<$Exact<O>, <T>(Decoder<T>) => T>> {
    // Compute this set at decoder definition time
    const allowedKeys = new Set(Object.keys(decodersByKey));

    // Check the inputted object for any unexpected extra keys
    const checked = pojo.reject((plainObj) => {
        const actualKeys = new Set(Object.keys(plainObj));
        const extraKeys = subtract(actualKeys, allowedKeys);
        return extraKeys.size > 0
            ? `Unexpected extra keys: ${Array.from(extraKeys).join(', ')}`
            : // Don't reject
              null;
    });

    // Defer to the "object" decoder for doing the real decoding work.  Since
    // we made sure there are no superfluous keys in this structure, it's now
    // safe to force-cast it to an $Exact<> type.
    return checked.then(object(decodersByKey).decode);
}

/**
 * Like `object()`, but will pass through any extra fields on the input object
 * unvalidated that will thus be of `unknown` type statically.
 */
export function inexact<O: { +[field: string]: AnyDecoder }>(
    decodersByKey: O,
): Decoder<$ObjMap<O, <T>(Decoder<T>) => T> & { +[string]: mixed }> {
    return pojo.then((plainObj) => {
        const allkeys = new Set(Object.keys(plainObj));
        const decoder = object(decodersByKey).transform(
            (safepart: $ObjMap<O, <T>(Decoder<T>) => T>) => {
                const safekeys = new Set(Object.keys(decodersByKey));

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
                        rv[k] = plainObj[k];
                    }
                });
                return rv;
            },
        );
        return decoder.decode(plainObj);
    });
}

/**
 * Accepts objects where all values match the given decoder, and returns the
 * result as a `Record<string, T>`.
 *
 * The main difference between `object()` and `dict()` is that you'd typically
 * use `object()` if this is a record-like object, where all field names are
 * known and the values are heterogeneous. Whereas with `dict()` the keys are
 * typically dynamic and the values homogeneous, like in a dictionary,
 * a lookup table, or a cache.
 */
export function dict<T>(decoder: Decoder<T>): Decoder<{ [string]: T }> {
    return pojo.then((plainObj, ok, err) => {
        let rv: { [key: string]: T } = {};
        let errors: { [key: string]: Annotation } | null = null;

        Object.keys(plainObj).forEach((key: string) => {
            const value = plainObj[key];
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
            return err(merge(annotateObject(plainObj), errors));
        } else {
            return ok(rv);
        }
    });
}

/**
 * Similar to `dict()`, but returns the result as a `Map<string, T>` (an [ES6
 * Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map))
 * instead.
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
