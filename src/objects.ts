/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  Annotation,
  Decoder,
  DecodeResult,
  DecoderType,
  ReadonlyDecoder,
} from '~/core';
import {
  annotate,
  annotateObject,
  defineReadonly,
  make,
  merge,
  updateText,
} from '~/core';
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
export const pojo: ReadonlyDecoder<Record<string, unknown>> = defineReadonly(
  isPlainObject,
  'Must be an object',
);

/**
 * Accepts objects with fields matching the given decoders. Extra fields that
 * exist on the input object are ignored and will not be returned.
 */
/**
 * Decodes the given fields of a plain object. Decoded values are written into
 * `out`, or only validated when `out` is null. Returns the error annotation for
 * the object, or null when all fields were accepted.
 */
function decodeFields(
  decoders: Record<string, Decoder<unknown>>,
  knownKeys: readonly string[],
  plainObj: Record<string, unknown>,
  out: Record<string, unknown> | null,
): Annotation | null {
  let errors: Map<string, Annotation> | null = null;
  let missingKeys: string[] | null = null;

  for (const key of knownKeys) {
    const decoder = decoders[key];
    const rawValue = plainObj[key];
    const result: DecodeResult<unknown> = decoder.decode(rawValue);

    if (result.ok) {
      const value = result.value;
      if (out !== null && value !== undefined) {
        out[key] = value;
      }
    } else {
      const ann = result.error;

      // Keep track of the annotation, but don't return just yet. We
      // want to collect more error information.
      if (rawValue === undefined) {
        // A rejected undefined value counts as a missing key. This treats
        // explicit undefineds the same as implicit undefineds (aka missing
        // keys).
        (missingKeys ??= []).push(key);
      } else {
        (errors ??= new Map()).set(key, ann);
      }
    }
  }

  // Deal with errors now. There are two classes of errors we want to
  // report.  First of all, we want to report any inline errors in this
  // object.  Lastly, any fields that are missing should be annotated on
  // the outer object itself.
  if (errors || missingKeys) {
    let objAnn = annotateObject(plainObj);

    if (errors) {
      objAnn = merge(objAnn, errors);
    }

    if (missingKeys) {
      const errMsg = missingKeys.map(quote).join(', ');
      const pluralized = missingKeys.length > 1 ? 'keys' : 'key';
      objAnn = updateText(objAnn, `Missing ${pluralized}: ${errMsg}`);
    }

    return objAnn;
  }

  return null;
}

/**
 * The shared implementation of `object()`, for callers that have already
 * rejected a `__proto__` key in the definition.
 */
/* #__NO_SIDE_EFFECTS__ */
function buildObject<Ds extends Record<string, Decoder<unknown>>>(
  decoders: Ds,
): Decoder<ObjectDecoderType<Ds>> {
  // Compute this list at decoder definition time
  const knownKeys = Object.keys(decoders);

  return pojo.chain((plainObj, ok, err) => {
    const record: Record<string, unknown> = {};
    const ann = decodeFields(decoders, knownKeys, plainObj, record);
    return ann ? err(ann) : ok(record as ObjectDecoderType<Ds>);
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
export function exact(
  decoders: Record<any, never>,
): ReadonlyDecoder<Record<string, never>>;
export function exact<Ds extends Record<string, ReadonlyDecoder<unknown>>>(
  decoders: Ds,
): ReadonlyDecoder<ObjectDecoderType<Ds>>;
export function exact<Ds extends Record<string, Decoder<unknown>>>(
  decoders: Ds,
): Decoder<ObjectDecoderType<Ds>>;
/* #__NO_SIDE_EFFECTS__ */
export function exact<Ds extends Record<string, Decoder<unknown>>>(
  decoders: Ds,
): Decoder<ObjectDecoderType<Ds>> {
  rejectUnsafeKey(decoders);

  // Compute these at decoder definition time
  const knownKeys = Object.keys(decoders);
  const allowedKeys = new Set(knownKeys);
  const objDecoder = buildObject(decoders);
  const ro = knownKeys.every((key) => decoders[key].isReadonly);

  return make<ObjectDecoderType<Ds>>((blob, ok, err) => {
    const base = pojo.decode(blob);
    if (!base.ok) return base;

    const plainObj = base.value;
    // Check the inputted object for any unexpected extra keys
    let extraKeys: string[] | null = null;
    for (const key of Object.keys(plainObj)) {
      // `__proto__` can never be a declared key, so it is never merely
      // "unexpected" here -- it is unsafe outright
      if (key === '__proto__') {
        return err(annotateUnsafeKey(plainObj));
      }

      if (!allowedKeys.has(key)) {
        (extraKeys ??= []).push(key);
      }
    }

    if (extraKeys) {
      return err(`Unexpected extra keys: ${extraKeys.map(quote).join(', ')}`);
    }

    if (ro) {
      // Readonly fields were all accepted as-is, so the input is a valid
      // ObjectDecoderType<Ds>
      const ann = decodeFields(decoders, knownKeys, plainObj, null);
      return ann ? err(ann) : ok(plainObj as ObjectDecoderType<Ds>);
    }

    // Defer to the "object" decoder for doing the real decoding work
    return objDecoder.decode(plainObj);
  }, ro);
}

/**
 * Like `object()`, but will pass through any extra fields on the input object
 * unvalidated that will thus be of `unknown` type statically.
 *
 * A `__proto__` key is the one exception: it cannot be passed through without
 * reassigning the prototype of the returned object, so inputs containing one
 * are rejected.
 */
export function inexact(
  decoders: Record<any, never>,
): ReadonlyDecoder<Record<string, unknown>>;
export function inexact<Ds extends Record<string, ReadonlyDecoder<unknown>>>(
  decoders: Ds,
): ReadonlyDecoder<ObjectDecoderType<Ds> & Record<string, unknown>>;
export function inexact<Ds extends Record<string, Decoder<unknown>>>(
  decoders: Ds,
): Decoder<ObjectDecoderType<Ds> & Record<string, unknown>>;
/* #__NO_SIDE_EFFECTS__ */
export function inexact<Ds extends Record<string, Decoder<unknown>>>(
  decoders: Ds,
): Decoder<ObjectDecoderType<Ds> & Record<string, unknown>> {
  rejectUnsafeKey(decoders);

  const knownKeys = Object.keys(decoders);
  const safekeys = new Set(knownKeys);
  const safeDecoder = buildObject(decoders);
  const ro = knownKeys.every((key) => decoders[key].isReadonly);
  return make<ObjectDecoderType<Ds> & Record<string, unknown>>((blob, ok, err) => {
    const base = pojo.decode(blob);
    if (!base.ok) return base;

    const plainObj = base.value;
    const allkeys = new Set(Object.keys(plainObj));

    // Bail out before validating anything else. Passing this key through
    // would reassign the prototype of the result rather than adding a key
    // to it, and there is no way to ask for it explicitly.
    if (allkeys.has('__proto__')) {
      return err(annotateUnsafeKey(plainObj));
    }

    if (ro) {
      // Readonly fields were all accepted as-is, so the input is a valid
      // ObjectDecoderType<Ds> & Record<string, unknown>
      const ann = decodeFields(decoders, knownKeys, plainObj, null);
      return ann
        ? err(ann)
        : ok(plainObj as ObjectDecoderType<Ds> & Record<string, unknown>);
    }

    const result = safeDecoder.decode(plainObj);
    if (!result.ok) return result;
    const safepart = result.value;

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
    return ok(rv as ObjectDecoderType<Ds> & Record<string, unknown>);
  }, ro);
}
