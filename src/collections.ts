import type { Annotation, Decoder } from '~/core';
import { annotate, annotateObject, formatShort, merge } from '~/core';
import { quote } from '~/lib/text';

import { array } from './arrays';
import { pojo } from './objects';

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
  return pojo.then((input, ok, err) => {
    let rv = {} as Record<K, V>;
    const errors: Map<string, Annotation> = new Map();

    for (const key of Object.keys(input)) {
      const value = input[key];
      const keyResult = keyDecoder?.decode(key);
      if (keyResult?.ok === false) {
        return err(
          annotate(input, `Invalid key ${quote(key)}: ${formatShort(keyResult.error)}`),
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
      return err(merge(annotateObject(input), errors));
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
 * Similar to `array()`, but returns the result as an [ES6
 * Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).
 */
export function setFromArray<T>(decoder: Decoder<T>): Decoder<Set<T>> {
  return array(decoder).transform((items) => new Set(items));
}

/**
 * Renamed to `setFromArray` to make room for a future `set()` decoder that
 * works differently.
 *
 * @deprecated This decoder will change behavior in a future version.
 */
export const set = setFromArray;

/**
 * Similar to `record()`, but returns the result as a `Map<string, T>` (an [ES6
 * Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map))
 * instead.
 */
export function mapping<T>(decoder: Decoder<T>): Decoder<Map<string, T>> {
  return record(decoder).transform((obj) => new Map(Object.entries(obj)));
}
