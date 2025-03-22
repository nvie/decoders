/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  Annotation,
  Decoder,
  DecodeResult,
  DecoderType,
  ReadonlyDecoder,
} from '~/core';
import { annotateObject, defineReadonly, merge, updateText } from '~/core';
import { difference } from '~/lib/set-methods';
import { quote } from '~/lib/text';
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
export const pojo: ReadonlyDecoder<Record<string, unknown>> = defineReadonly(
  isPojo,
  'Must be an object',
);

/**
 * Accepts objects with fields matching the given decoders. Extra fields that
 * exist on the input object are ignored and will not be returned.
 */
export function object(decoders: Record<any, never>): Decoder<Record<string, never>>;
export function object<Ds extends Record<string, Decoder<unknown>>>(
  decoders: Ds,
): Decoder<ObjectDecoderType<Ds>>;
export function object<Ds extends Record<string, Decoder<unknown>>>(
  decoders: Ds,
): Decoder<ObjectDecoderType<Ds>> {
  // Compute this set at decoder definition time
  const knownKeys = new Set(Object.keys(decoders));

  return pojo.then((plainObj, ok, err) => {
    const actualKeys = new Set(Object.keys(plainObj));

    // At this point, "missingKeys" will also include all fields that may
    // validly be optional. We'll let the underlying decoder decide and
    // remove the key from this missing set if the decoder accepts the
    // value.
    const missingKeys = difference(knownKeys, actualKeys);

    const record = {};
    let errors: Map<string, Annotation> | null = null;

    for (const key of Object.keys(decoders)) {
      const decoder = decoders[key];
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

/**
 * Like `object()`, but will reject inputs that contain extra fields that are
 * not specified explicitly.
 */
export function exact(decoders: Record<any, never>): Decoder<Record<string, never>>;
export function exact<Ds extends Record<string, Decoder<unknown>>>(
  decoders: Ds,
): Decoder<ObjectDecoderType<Ds>>;
export function exact<Ds extends Record<string, Decoder<unknown>>>(
  decoders: Ds,
): Decoder<ObjectDecoderType<Ds>> {
  // Compute this set at decoder definition time
  const allowedKeys = new Set(Object.keys(decoders));

  // Check the inputted object for any unexpected extra keys
  const checked = pojo.reject((plainObj) => {
    const actualKeys = new Set(Object.keys(plainObj));
    const extraKeys = difference(actualKeys, allowedKeys);
    return extraKeys.size > 0
      ? `Unexpected extra keys: ${Array.from(extraKeys).map(quote).join(', ')}`
      : null;
  });

  // Defer to the "object" decoder for doing the real decoding work
  return checked.pipe(object(decoders));
}

/**
 * Like `object()`, but will pass through any extra fields on the input object
 * unvalidated that will thus be of `unknown` type statically.
 */
export function inexact(decoders: Record<any, never>): Decoder<Record<string, unknown>>;
export function inexact<Ds extends Record<string, Decoder<unknown>>>(
  decoders: Ds,
): Decoder<ObjectDecoderType<Ds> & Record<string, unknown>>;
export function inexact<Ds extends Record<string, Decoder<unknown>>>(
  decoders: Ds,
): Decoder<ObjectDecoderType<Ds> & Record<string, unknown>> {
  return pojo.pipe((plainObj) => {
    const allkeys = new Set(Object.keys(plainObj));
    return object(decoders).transform((safepart) => {
      const safekeys = new Set(Object.keys(decoders));

      // To account for hard-coded keys that aren't part of the input
      for (const k of safekeys) allkeys.add(k);

      const rv = {} as ObjectDecoderType<Ds> & Record<string, unknown>;
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
  });
}
