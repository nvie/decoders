import type { Decoder, ReadonlyDecoder } from '~/core';
import { annotate, define, defineReadonly, make } from '~/core';
import type { Sized, SizeOptions } from '~/lib/options';
import { bySizeOptions } from '~/lib/options';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export interface Klass<T> extends Function {
  // eslint-disable-next-line @typescript-eslint/prefer-function-type,@typescript-eslint/no-explicit-any
  new (...args: readonly any[]): T;
}

export type Instance<K> = K extends Klass<infer T> ? T : never;

/**
 * Accepts any value that is an ``instanceof`` the given class.
 */
/* #__NO_SIDE_EFFECTS__ */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function instanceOf<K extends Klass<any>>(klass: K): ReadonlyDecoder<Instance<K>> {
  return defineReadonly(
    (blob): blob is Instance<K> => blob instanceof klass,
    `Must be ${klass.name} instance`,
  );
}

/**
 * Lazily evaluate the given decoder. This is useful to build self-referential
 * types for recursive data structures. The factory is called once, on first
 * decode, and its result is reused from then on.
 *
 * Pass `{ readonly: true }` to declare the resulting decoder readonly. The
 * decoder returned by the factory must then be readonly too, which is checked
 * when it's first called.
 */
export function lazy<T>(
  decoderFn: () => ReadonlyDecoder<T>,
  options: { readonly: true },
): ReadonlyDecoder<T>;
export function lazy<T>(decoderFn: () => Decoder<T>): Decoder<T>;
/* #__NO_SIDE_EFFECTS__ */
export function lazy<T>(
  decoderFn: () => Decoder<T>,
  options?: { readonly: true },
): Decoder<T> {
  const ro = options?.readonly === true;
  let decoder: Decoder<T> | undefined;
  return make((blob) => {
    if (decoder === undefined) {
      const d = decoderFn();
      if (ro && !d.isReadonly) {
        throw new Error(
          'Decoder setup error: lazy() was declared readonly, but its decoder is not',
        );
      }
      decoder = d;
    }
    return decoder.decode(blob);
  }, ro);
}

/**
 * Only accept strings, arrays, or sets with given length constraints.
 */
export function sized<T extends Sized>(
  decoder: ReadonlyDecoder<T>,
  options: SizeOptions,
): ReadonlyDecoder<T>;
export function sized<T extends Sized>(
  decoder: Decoder<T>,
  options: SizeOptions,
): Decoder<T>;
/* #__NO_SIDE_EFFECTS__ */
export function sized<T extends Sized>(
  decoder: Decoder<T>,
  options: SizeOptions,
): Decoder<T> {
  return decoder.reject(bySizeOptions(options));
}

/**
 * Pre-process the data input before passing it into the decoder. This gives
 * you the ability to arbitrarily customize the input on the fly before passing
 * it to the decoder. Of course, the input value at that point is still of
 * ``unknown`` type, so you will have to deal with that accordingly.
 */
/* #__NO_SIDE_EFFECTS__ */
export function prep<T>(
  mapperFn: (blob: unknown) => unknown,
  decoder: Decoder<T>,
): Decoder<T> {
  return define((originalInput, _, err) => {
    let blob;
    try {
      blob = mapperFn(originalInput);
    } catch (e: unknown) {
      return err(
        annotate(
          originalInput,
          // istanbul ignore next
          e instanceof Error ? e.message : String(e),
        ),
      );
    }

    const r = decoder.decode(blob);
    return r.ok ? r : err(annotate(originalInput, r.error.text));
    //                             ^^^^^^^^^^^^^
    //                             Annotates the _original_ input value
    //                             (instead of echoing back blob)
  });
}
