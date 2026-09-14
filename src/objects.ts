/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Annotation, Decoder, DecodeResult, DecoderType } from '~/core';
import { annotate, annotateObject, define, merge, updateText } from '~/core';
import { difference } from '~/lib/set-methods';
import { quote } from '~/lib/text';
import { isPlainObject } from '~/lib/utils';

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
 * Refuses decoder definitions that declare an unsafe `__proto__` key.
 *
 * In an object literal, both `{ __proto__: d }` and `{ "__proto__": d }` set
 * the prototype instead of defining a key, so such a definition has no keys at
 * all and the decoder would silently validate nothing. Only the computed form
 * `{ ['__proto__']: d }` defines a real key -- and that is the only form that
 * could write the key to a decoded result, so that is the one rejected here.
 */
/* #__NO_SIDE_EFFECTS__ */
function rejectUnsafeKey(decoders: Record<string, unknown>): void {
  if (Object.prototype.hasOwnProperty.call(decoders, '__proto__')) {
    throw new Error(
      'Unsafe key: "__proto__" cannot be used in an object(), exact(), or inexact() definition',
    );
  }
}

/**
 * Marks the `__proto__` field of an input object as unsafe. Reported on the
 * field itself, like any other bad field, rather than on the outer object.
 */
/* #__NO_SIDE_EFFECTS__ */
function annotateUnsafeKey(plainObj: Record<string, unknown>): Annotation {
  return merge(
    annotateObject(plainObj),
    new Map([['__proto__', annotate(plainObj['__proto__'], 'Unsafe key')]]),
  );
}

/**
 * Accepts any "plain old JavaScript object", but doesn't validate its keys or
 * values further.
 */
export const pojo: Decoder<Record<string, unknown>> = define((blob, ok, err) =>
  isPlainObject(blob) ? ok(blob) : err('Must be an object'),
);

/**
 * Accepts objects with fields matching the given decoders. Extra fields that
 * exist on the input object are ignored and will not be returned.
 */
/**
 * The shared implementation of `object()`, for callers that have already
 * rejected a `__proto__` key in the definition.
 */
/* #__NO_SIDE_EFFECTS__ */
function buildObject<Ds extends Record<string, Decoder<unknown>>>(
  decoders: Ds,
): Decoder<ObjectDecoderType<Ds>> {
  // Compute this set at decoder definition time
  const knownKeys = new Set(Object.keys(decoders));

  return pojo.chain((plainObj, ok, err) => {
    const actualKeys = new Set(Object.keys(plainObj));

    // At this point, "missingKeys" will also include all fields that may
    // validly be optional. We'll let the underlying decoder decide and
    // remove the key from this missing set if the decoder accepts the
    // value.
    const missingKeys = difference(knownKeys, actualKeys);

    const record: Record<string, unknown> = {};
    let errors: Map<string, Annotation> | null = null;

    for (const key of Object.keys(decoders)) {
      const decoder = decoders[key];
      const rawValue = plainObj[key];
      const result: DecodeResult<unknown> = decoder.decode(rawValue);

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
          errors ??= new Map();
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
        const errMsg = Array.from(missingKeys).map(quote).join(', ');
        const pluralized = missingKeys.size > 1 ? 'keys' : 'key';
        objAnn = updateText(objAnn, `Missing ${pluralized}: ${errMsg}`);
      }

      return err(objAnn);
    }

    return ok(record as ObjectDecoderType<Ds>);
  });
}

export function object(decoders: Record<any, never>): Decoder<Record<string, never>>;
export function object<Ds extends Record<string, Decoder<unknown>>>(
  decoders: Ds,
): Decoder<ObjectDecoderType<Ds>>;
/* #__NO_SIDE_EFFECTS__ */
export function object<Ds extends Record<string, Decoder<unknown>>>(
  decoders: Ds,
): Decoder<ObjectDecoderType<Ds>> {
  rejectUnsafeKey(decoders);
  return buildObject(decoders);
}

/**
 * Like `object()`, but will reject inputs that contain extra fields that are
 * not specified explicitly.
 */
export function exact(decoders: Record<any, never>): Decoder<Record<string, never>>;
export function exact<Ds extends Record<string, Decoder<unknown>>>(
  decoders: Ds,
): Decoder<ObjectDecoderType<Ds>>;
/* #__NO_SIDE_EFFECTS__ */
export function exact<Ds extends Record<string, Decoder<unknown>>>(
  decoders: Ds,
): Decoder<ObjectDecoderType<Ds>> {
  rejectUnsafeKey(decoders);

  // Compute this set at decoder definition time
  const allowedKeys = new Set(Object.keys(decoders));

  // Check the inputted object for any unexpected extra keys
  const checked = pojo.chain<Record<string, unknown>>((plainObj, ok, err) => {
    const actualKeys = new Set(Object.keys(plainObj));

    // `__proto__` can never be a declared key, so it is never merely
    // "unexpected" here -- it is unsafe outright
    if (actualKeys.has('__proto__')) {
      return err(annotateUnsafeKey(plainObj));
    }

    const extraKeys = difference(actualKeys, allowedKeys);
    return extraKeys.size > 0
      ? err(`Unexpected extra keys: ${Array.from(extraKeys).map(quote).join(', ')}`)
      : ok(plainObj);
  });

  // Defer to the "object" decoder for doing the real decoding work
  return checked.pipe(buildObject(decoders));
}

/**
 * Like `object()`, but will pass through any extra fields on the input object
 * unvalidated that will thus be of `unknown` type statically.
 *
 * A `__proto__` key is the one exception: it cannot be passed through without
 * reassigning the prototype of the returned object, so inputs containing one
 * are rejected.
 */
export function inexact(decoders: Record<any, never>): Decoder<Record<string, unknown>>;
export function inexact<Ds extends Record<string, Decoder<unknown>>>(
  decoders: Ds,
): Decoder<ObjectDecoderType<Ds> & Record<string, unknown>>;
/* #__NO_SIDE_EFFECTS__ */
export function inexact<Ds extends Record<string, Decoder<unknown>>>(
  decoders: Ds,
): Decoder<ObjectDecoderType<Ds> & Record<string, unknown>> {
  rejectUnsafeKey(decoders);

  return pojo.chain<ObjectDecoderType<Ds> & Record<string, unknown>>(
    (plainObj, _ok, err) => {
      const allkeys = new Set(Object.keys(plainObj));

      // Bail out before validating anything else. Passing this key through
      // would reassign the prototype of the result rather than adding a key
      // to it, and there is no way to ask for it explicitly.
      if (allkeys.has('__proto__')) {
        return err(annotateUnsafeKey(plainObj));
      }

      return buildObject(decoders).transform((safepart) => {
        const safekeys = new Set(Object.keys(decoders));

        // To account for hard-coded keys that aren't part of the input
        for (const k of safekeys) allkeys.add(k);

        const rv: Record<string, unknown> = {};
        for (const k of allkeys) {
          if (safekeys.has(k)) {
            const value = safepart[k];
            if (value !== undefined) {
              rv[k] = value;
            }
          } else {
            rv[k] = plainObj[k];
          }
        }
        return rv as ObjectDecoderType<Ds> & Record<string, unknown>;
      });
    },
  );
}
