import type { Annotation, Decoder, DecodeResult, DecoderType } from '~/core';
import { annotate, define } from '~/core';

/**
 * Accepts any array, but doesn't validate its items further.
 *
 * "poja" means "plain old JavaScript array", a play on `pojo()`.
 */
export const poja: Decoder<unknown[]> = define((blob, ok, err) => {
  if (!Array.isArray(blob)) {
    return err('Must be an array');
  }
  return ok(blob as unknown[]);
});

/**
 * Given an array of Result instances, loop over them all and return:
 * - An [index, err] tuple, indicating the (index of the) first Err instance
 *   encountered; or
 * - a new Ok with an array of all unwrapped Ok'ed values
 */
function all<T>(
  items: readonly DecodeResult<T>[],
  blobs: readonly unknown[],

  // TODO: Make this less ugly
  ok: (value: T[]) => DecodeResult<T[]>,
  err: (ann: Annotation) => DecodeResult<T[]>,
): DecodeResult<T[]> {
  const results: T[] = [];
  for (let index = 0; index < items.length; ++index) {
    const result = items[index];
    if (result.ok) {
      results.push(result.value);
    } else {
      const ann = result.error;

      // Rewrite the annotation to include the index information, and inject it into the original blob
      const clone = blobs.slice();
      clone.splice(
        index,
        1,
        annotate(ann, ann.text ? `${ann.text} (at index ${index})` : `index ${index}`),
      );

      return err(annotate(clone));
    }
  }
  return ok(results);
}

/**
 * Accepts arrays of whatever the given decoder accepts.
 */
export function array<T>(decoder: Decoder<T>): Decoder<T[]> {
  const decodeFn = decoder.decode;
  return poja.then((blobs: readonly unknown[], ok, err) => {
    const results = blobs.map(decodeFn);
    return all(results, blobs, ok, err);
  });
}

function isNonEmpty<T>(arr: readonly T[]): arr is [T, ...T[]] {
  return arr.length > 0;
}

/**
 * Like `array()`, but will reject arrays with 0 elements.
 */
export function nonEmptyArray<T>(decoder: Decoder<T>): Decoder<[T, ...T[]]> {
  return array(decoder).refine(isNonEmpty, 'Must be non-empty array');
}

/**
 * Similar to `array()`, but returns the result as an [ES6
 * Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).
 */
export function set<T>(decoder: Decoder<T>): Decoder<Set<T>> {
  return array(decoder).transform((items) => new Set(items));
}

const ntuple = (n: number) =>
  poja.refine((arr) => arr.length === n, `Must be a ${n}-tuple`);

type TupleDecoderType<Ds extends readonly Decoder<unknown>[]> = {
  [K in keyof Ds]: DecoderType<Ds[K]>;
};

/**
 * Accepts a tuple (an array with exactly _n_ items) of values accepted by the
 * _n_ given decoders.
 */
export function tuple<
  Ds extends readonly [first: Decoder<unknown>, ...rest: readonly Decoder<unknown>[]],
>(...decoders: Ds): Decoder<TupleDecoderType<Ds>> {
  return ntuple(decoders.length).then((blobs, ok, err) => {
    let allOk = true;

    const rvs = decoders.map((decoder, i) => {
      const blob = blobs[i];
      const result = decoder.decode(blob);
      if (result.ok) {
        return result.value;
      } else {
        allOk = false;
        return result.error;
      }
    });

    if (allOk) {
      return ok(rvs as TupleDecoderType<Ds>);
    } else {
      // If a decoder error has happened while unwrapping all the
      // results, try to construct a good error message
      return err(annotate(rvs));
    }
  });
}
