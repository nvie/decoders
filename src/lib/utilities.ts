import { annotate } from '../annotate';
import { define } from '../Decoder';
import type { Decoder } from '../Decoder';

// eslint-disable-next-line @typescript-eslint/ban-types
export interface Klass<T> extends Function {
  new (...args: readonly any[]): T;
}

export type Instance<K> = K extends Klass<infer T> ? T : never;

/**
 * Accepts any value that is an ``instanceof`` the given class.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function instanceOf<K extends Klass<any>>(klass: K): Decoder<Instance<K>> {
  return define((blob, ok, err) =>
    blob instanceof klass ? ok(blob) : err(`Must be ${klass.name} instance`),
  );
}

/**
 * Lazily evaluate the given decoder. This is useful to build self-referential
 * types for recursive data structures.
 */
export function lazy<T>(decoderFn: () => Decoder<T>): Decoder<T> {
  return define((blob) => decoderFn().decode(blob));
}

/**
 * Pre-process the data input before passing it into the decoder. This gives
 * you the ability to arbitrarily customize the input on the fly before passing
 * it to the decoder. Of course, the input value at that point is still of
 * ``unknown`` type, so you will have to deal with that accordingly.
 */
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
