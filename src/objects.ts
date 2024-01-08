/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Annotation, Decoder, DecodeResult, DecoderType } from '~/core';
import { annotate, annotateObject, define, formatShort, merge, updateText } from '~/core';
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
      ? `Unexpected extra keys: ${Array.from(extraKeys).join(', ')}`
      : // Don't reject
        null;
  });

  // Defer to the "object" decoder for doing the real decoding work
  return checked.then(object(decoders).decode);
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
  return pojo.then((plainObj) => {
    const allkeys = new Set(Object.keys(plainObj));
    const decoder = object(decoders).transform((safepart) => {
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
    return decoder.decode(plainObj);
  });
}

/**
 * Accepts objects where all values match the given decoder, and returns the
 * result as a `Record<string, V>`.
 */
export function record<V>(valueDecoder: Decoder<V>): Decoder<Record<string, V>>;
/**
 * Accepts objects where all keys and values match the given decoders, and
 * returns the result as a `Record<K, V>`. The given key decoder must return
 * strings.
 */
export function record<K extends string, V>(keyDecoder: Decoder<K>, valueDecoder: Decoder<V>): Decoder<Record<K, V>>; // prettier-ignore
export function record<K extends string, V>(
  fst: Decoder<K> | Decoder<V>,
  snd?: Decoder<V>,
): Decoder<Record<K, V>> {
  const keyDecoder = snd !== undefined ? (fst as Decoder<K>) : undefined;
  const valueDecoder = snd !== undefined ? snd : (fst as Decoder<V>);
  return pojo.then((rec, ok, err) => {
    let rv = {} as Record<K, V>;
    const errors: Map<string, Annotation> = new Map();

    for (const [key, value] of Object.entries(rec)) {
      const keyResult = keyDecoder?.decode(key);
      if (keyResult?.ok === false) {
        return err(
          annotate(
            rec,
            `Invalid key ${JSON.stringify(key)}: ${formatShort(keyResult.error)}`,
          ),
        );
      }

      const k = keyResult?.value ?? (key as K);

      const result = valueDecoder.decode(value);
      if (result.ok) {
        if (errors.size === 0) {
          rv[k] = result.value;
        }
      } else {
        errors.set(key, result.error);
        rv = {} as Record<K, V>; // Clear the success value so it can get garbage collected early
      }
    }

    if (errors.size > 0) {
      return err(merge(annotateObject(rec), errors));
    } else {
      return ok(rv);
    }
  });
}

/**
 * @deprecated Will get removed in a future version.
 *
 * Alias of `record()`.
 */
export const dict = record;

/**
 * Similar to `record()`, but returns the result as a `Map<string, T>` (an [ES6
 * Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map))
 * instead.
 *
 * @deprecated Will get removed in a future version.
 */
export function mapping<T>(decoder: Decoder<T>): Decoder<Map<string, T>> {
  return record(decoder).transform((obj) => new Map(Object.entries(obj)));
}
