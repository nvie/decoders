import type { Decoder, DecoderType } from '~/core';
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
 * Accepts arrays of whatever the given decoder accepts.
 */
export function array<T>(decoder: Decoder<T>): Decoder<T[]> {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const decodeFn = decoder.decode;
  return poja.then((inputs: readonly unknown[], ok, err) => {
    const results: T[] = [];
    for (let i = 0; i < inputs.length; ++i) {
      const blob = inputs[i];
      const result = decodeFn(blob);
      if (result.ok) {
        results.push(result.value);
      } else {
        results.length = 0; // Forget all results collected so far
        const ann = result.error;

        // Rewrite the annotation to include the index information, and inject it into the original blob
        const clone = inputs.slice();
        clone.splice(
          i,
          1,
          annotate(ann, ann.text ? `${ann.text} (at index ${i})` : `index ${i}`),
        );

        return err(annotate(clone));
      }
    }
    return ok(results);
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

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (allOk) {
      return ok(rvs as TupleDecoderType<Ds>);
    } else {
      // If a decoder error has happened while unwrapping all the
      // results, try to construct a good error message
      return err(annotate(rvs));
    }
  });
}
