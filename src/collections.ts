import type { Annotation, Decoder } from '~/core';
import { annotate, annotateObject, formatShort, isDecoder, merge } from '~/core';
import type { SizeOptions } from '~/lib/size-options';
import { bySizeOptions } from '~/lib/size-options';
import { quote } from '~/lib/text';

import { array } from './arrays';
import { pojo } from './objects';

/**
 * Accepts objects where all values match the given decoder, and returns the
 * result as a `Record<string, V>`. The optional size options constrain the
 * number of keys.
 */
export function record<V>(valueDecoder: Decoder<V>, options?: SizeOptions): Decoder<Record<string, V>>; // prettier-ignore
/**
 * Accepts objects where all keys and values match the given decoders, and
 * returns the result as a `Record<K, V>`. The given key decoder must return
 * strings. The optional size options constrain the number of keys.
 */
export function record<K extends string, V>(keyDecoder: Decoder<K>, valueDecoder: Decoder<V>, options?: SizeOptions): Decoder<Record<K, V>>; // prettier-ignore
/* #__NO_SIDE_EFFECTS__ */
export function record<K extends string, V>(
  fst: Decoder<K> | Decoder<V>,
  snd?: Decoder<V> | SizeOptions,
  trd?: SizeOptions,
): Decoder<Record<K, V>> {
  const twoDecoders = isDecoder(snd);
  const keyDecoder = twoDecoders ? (fst as Decoder<K>) : undefined;
  const valueDecoder = twoDecoders ? snd : (fst as Decoder<V>);
  const options = twoDecoders ? trd : snd;
  const checkSize = options !== undefined ? bySizeOptions(options, 'key') : undefined;
  return pojo.chain((input, ok, err) => {
    const keys = Object.keys(input);

    // Check the number of keys before decoding any of them, so large inputs
    // get rejected without walking them
    const sizeError = checkSize?.(keys);
    if (sizeError) {
      return err(sizeError);
    }

    let rv = {} as Record<K, V>;
    const errors = new Map<string, Annotation>();

    for (const key of keys) {
      const value = input[key];

      // Writing this key would reassign the prototype of `rv` rather than
      // adding a key to it, and `record()` has no way to declare that one is
      // expected, so report it like any other bad field.
      if (key === '__proto__') {
        errors.set(key, annotate(value, 'Unsafe key'));
        rv = {} as Record<K, V>; // Clear the success value so it can get garbage collected early
        continue;
      }

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
 * Similar to `array()`, but returns the result as an [ES6
 * Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).
 */
/* #__NO_SIDE_EFFECTS__ */
export function setFromArray<T>(decoder: Decoder<T>): Decoder<Set<T>> {
  return array(decoder).transform((items) => new Set(items));
}

/**
 * Similar to `record()`, but returns the result as a `Map<string, T>` (an [ES6
 * Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map))
 * instead.
 */
/* #__NO_SIDE_EFFECTS__ */
export function mapping<T>(decoder: Decoder<T>): Decoder<Map<string, T>> {
  return record(decoder).transform((obj) => new Map(Object.entries(obj)));
}
