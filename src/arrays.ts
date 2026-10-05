import type { Decoder, DecoderType, ReadonlyDecoder } from '~/core';
import { annotate, defineReadonly, make } from '~/core';
import type { SizeOptions } from '~/lib/options';
import { sized } from '~/misc';

/**
 * Accepts any array, but doesn't validate its items further.
 *
 * "poja" means "plain old JavaScript array", a play on `pojo()`.
 */
export const poja: ReadonlyDecoder<unknown[]> = defineReadonly(
  (blob): blob is unknown[] => Array.isArray(blob),
  'Must be an array',
);

/**
 * Accepts arrays of whatever the given decoder accepts.
 */
export function array<T>(
  decoder: ReadonlyDecoder<T>,
  options?: SizeOptions,
): ReadonlyDecoder<T[]>;
export function array<T>(decoder: Decoder<T>, options?: SizeOptions): Decoder<T[]>;
/* #__NO_SIDE_EFFECTS__ */
export function array<T>(decoder: Decoder<T>, options?: SizeOptions): Decoder<T[]> {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const baseDecodeFn = (options !== undefined ? sized(poja, options) : poja).decode;
  const itemDecodeFn = decoder.decode;
  const ro = decoder.isReadonly;
  return make((blob, ok, err) => {
    const base = baseDecodeFn(blob);
    if (!base.ok) return base;

    const inputs = base.value;
    const results: T[] = [];
    for (let i = 0; i < inputs.length; ++i) {
      const result = itemDecodeFn(inputs[i]);
      if (result.ok) {
        if (!ro) results.push(result.value);
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
    // Readonly items were all accepted as-is, so the input is a valid T[]
    return ok(ro ? (inputs as T[]) : results);
  }, ro);
}

/**
 * Like `array()`, but will reject arrays with 0 elements.
 */
export function nonEmptyArray<T>(
  decoder: ReadonlyDecoder<T>,
): ReadonlyDecoder<[T, ...T[]]>;
export function nonEmptyArray<T>(decoder: Decoder<T>): Decoder<[T, ...T[]]>;
/* #__NO_SIDE_EFFECTS__ */
export function nonEmptyArray<T>(decoder: Decoder<T>): Decoder<[T, ...T[]]> {
  return array(decoder, { min: 1 }).refineType<[T, ...T[]]>();
}

/* #__NO_SIDE_EFFECTS__ */
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
  Ds extends readonly [
    first: ReadonlyDecoder<unknown>,
    ...rest: readonly ReadonlyDecoder<unknown>[],
  ],
>(...decoders: Ds): ReadonlyDecoder<TupleDecoderType<Ds>>;
export function tuple<
  Ds extends readonly [first: Decoder<unknown>, ...rest: readonly Decoder<unknown>[]],
>(...decoders: Ds): Decoder<TupleDecoderType<Ds>>;
/* #__NO_SIDE_EFFECTS__ */
export function tuple<
  Ds extends readonly [first: Decoder<unknown>, ...rest: readonly Decoder<unknown>[]],
>(...decoders: Ds): Decoder<TupleDecoderType<Ds>> {
  const decodeBase = ntuple(decoders.length).decode;
  const ro = decoders.every((d) => d.isReadonly);
  return make((input, ok, err) => {
    const base = decodeBase(input);
    if (!base.ok) return base;

    const blobs = base.value;
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
      // Readonly items were all accepted as-is, so the input is a valid tuple
      return ok((ro ? blobs : rvs) as TupleDecoderType<Ds>);
    } else {
      // If a decoder error has happened while unwrapping all the
      // results, try to construct a good error message
      return err(annotate(rvs));
    }
  }, ro);
}
