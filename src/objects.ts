/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Annotation, Decoder, DecodeResult, DecoderType } from '~/core';
import { annotateObject, define, merge, updateText } from '~/core';
import { difference } from '~/lib/set-methods';
import { isPojo } from '~/lib/utils';

type RequiredKeys<T extends object> = {
  [K in keyof T]: undefined extends T[K] ? never : K;
}[keyof T];

type Resolve<T> = T extends (...args: readonly unknown[]) => unknown
  ? T
  : { [K in keyof T]: T[K] };

/**
 * Transforms an object type, by marking all fields that contain "undefined"
 * with a question mark, i.e. allowing implicit-undefineds when
 * explicit-undefined are also allowed.
 *
 * For example, if:
 *
 *   type User = {
 *     name: string;
 *     age: number | null | undefined;
 *   }
 *
 * Then UndefinedToOptional<User> will become equivalent to:
 *
 *   {
 *     name: string;
 *     age?: number | null | undefined;
 *        ^
 *        Note the question mark
 *   }
 */
type UndefinedToOptional<T extends object> = Resolve<
  Pick<Required<T>, RequiredKeys<T>> & Partial<T>
>;

type ObjectDecoderType<Ds extends Record<string, Decoder<unknown>>> =
  UndefinedToOptional<{
    [K in keyof Ds]: DecoderType<Ds[K]>;
  }>;

/**
 * Accepts any "plain old JavaScript object", but doesn't validate its keys or
 * values further.
 */
export const pojo: Decoder<Record<string, unknown>> = define((blob, ok, err) =>
  isPojo(blob) ? ok(blob) : err('Must be an object'),
);

/**
 * Accepts objects with fields matching the given decoders. Extra fields that
 * exist on the input object are ignored and will not be returned.
 */
export function object(decodersByKey: Record<any, never>): Decoder<Record<string, never>>;
export function object<Ds extends Record<string, Decoder<any>>>(
  decodersByKey: Ds,
): Decoder<ObjectDecoderType<Ds>>;
export function object<Ds extends Record<string, Decoder<any>>>(
  decodersByKey: Ds,
): Decoder<ObjectDecoderType<Ds>> {
  // Compute this set at decoder definition time
  const knownKeys = new Set(Object.keys(decodersByKey));

  return pojo.then((plainObj, ok, err) => {
    const actualKeys = new Set(Object.keys(plainObj));

    // At this point, "missingKeys" will also include all fields that may
    // validly be optional. We'll let the underlying decoder decide and
    // remove the key from this missing set if the decoder accepts the
    // value.
    const missingKeys = difference(knownKeys, actualKeys);

    const record = {};
    let errors: Map<string, Annotation> | null = null;

    for (const key of Object.keys(decodersByKey)) {
      const decoder = decodersByKey[key];
      const rawValue = plainObj[key];
      const result: DecodeResult<unknown> = decoder.decode(rawValue);

      if (result.ok) {
        const value = result.value;
        if (value !== undefined) {
          // @ts-expect-error - look into this later
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
            errors = new Map();
          }
          errors.set(key, ann);
        }
      }
    }

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

    return ok(record as ObjectDecoderType<Ds>);
  });
}

/**
 * Like `object()`, but will reject inputs that contain extra fields that are
 * not specified explicitly.
 */
export function exact(decodersByKey: Record<any, never>): Decoder<Record<string, never>>;
export function exact<O extends Record<string, Decoder<any>>>(
  decodersByKey: O,
): Decoder<{ [K in keyof ObjectDecoderType<O>]: ObjectDecoderType<O>[K] }>;
export function exact<O extends Record<string, Decoder<any>>>(
  decodersByKey: O,
): Decoder<{ [K in keyof ObjectDecoderType<O>]: ObjectDecoderType<O>[K] }> {
  //     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //     Ditto (see above)

  // Compute this set at decoder definition time
  const allowedKeys = new Set(Object.keys(decodersByKey));

  // Check the inputted object for any unexpected extra keys
  const checked = pojo.reject((plainObj) => {
    const actualKeys = new Set(Object.keys(plainObj));
    const extraKeys = difference(actualKeys, allowedKeys);
    return extraKeys.size > 0
      ? `Unexpected extra keys: ${Array.from(extraKeys).join(', ')}`
      : // Don't reject
        null;
  });

  // Defer to the "object" decoder for doing the real decoding work
  return checked.then(object(decodersByKey).decode);
}

/**
 * Like `object()`, but will pass through any extra fields on the input object
 * unvalidated that will thus be of `unknown` type statically.
 */
export function inexact(
  decodersByKey: Record<any, never>,
): Decoder<Record<string, unknown>>;
export function inexact<O extends Record<string, Decoder<any>>>(
  decodersByKey: O,
): Decoder<
  { [K in keyof ObjectDecoderType<O>]: ObjectDecoderType<O>[K] } & Record<string, unknown>
>;
export function inexact<O extends Record<string, Decoder<any>>>(
  decodersByKey: O,
): Decoder<
  { [K in keyof ObjectDecoderType<O>]: ObjectDecoderType<O>[K] } & Record<string, unknown>
> {
  return pojo.then((plainObj) => {
    const allkeys = new Set(Object.keys(plainObj));
    const decoder = object(decodersByKey).transform((safepart) => {
      const safekeys = new Set(Object.keys(decodersByKey));

      // To account for hard-coded keys that aren't part of the input
      for (const k of safekeys) allkeys.add(k);

      const rv = {} as {
        [K in keyof ObjectDecoderType<O>]: ObjectDecoderType<O>[K];
      } & Record<string, unknown>;
      for (const k of allkeys) {
        if (safekeys.has(k)) {
          const value = safepart[k];
          if (value !== undefined) {
            // @ts-expect-error - look into this later
            rv[k] = value;
          }
        } else {
          // @ts-expect-error - look into this later
          rv[k] = plainObj[k];
        }
      }
      return rv;
    });
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
export function dict<T>(decoder: Decoder<T>): Decoder<Record<string, T>> {
  return pojo.then((plainObj, ok, err) => {
    let rv: Record<string, T> = {};
    let errors: Map<string, Annotation> | null = null;

    for (const key of Object.keys(plainObj)) {
      const value = plainObj[key];
      const result = decoder.decode(value);
      if (result.ok) {
        if (errors === null) {
          rv[key] = result.value;
        }
      } else {
        rv = {}; // Clear the success value so it can get garbage collected early
        if (errors === null) {
          errors = new Map();
        }
        errors.set(key, result.error);
      }
    }

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
