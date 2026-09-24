import type { Annotation } from './annotate';
import { annotate, isAnnotation } from './annotate';
import type { Formatter } from './format';
import { formatAsIssues, formatInline } from './format';
import type { Result } from './Result';
import { err as makeErr, ok as makeOk } from './Result';
import type { StandardSchemaV1 } from './standard-schema';

export type DecodeResult<T> = Result<T, Annotation>;

/**
 * A function taking a untrusted input, and returning a DecodeResult<T>. The
 * `ok()` and `err()` constructor functions are provided as the 2nd and 3rd
 * param. One of these should be called and its value returned.
 */
//                  Output  Input
//                      \    /
export type AcceptanceFn<O, I = unknown> = (
  blob: I,
  ok: (value: O) => DecodeResult<O>,
  err: (msg: string | Annotation) => DecodeResult<O>,
) => DecodeResult<O>;

//          Output  Input
//              \    /
export type Next<O, I = unknown> =
  | Decoder<O>
  | ((
      blob: I,
      ok: (value: O) => DecodeResult<O>,
      err: (msg: string | Annotation) => DecodeResult<O>,
    ) => DecodeResult<O> | Decoder<O>);

export interface Decoder<T> {
  /**
   * Verifies untrusted input. Either returns a value, or throws a decoding
   * error.
   */
  verify(blob: unknown, formatterFn?: (ann: Annotation) => string | Error): T;

  /**
   * Verifies untrusted input. Either returns a value, or returns undefined.
   */
  value(blob: unknown): T | undefined;

  /**
   * Verifies untrusted input. Always returns a DecodeResult, which is either
   * an "ok" value or an "error" annotation.
   */
  decode(blob: unknown): DecodeResult<T>;

  /**
   * Build a new decoder from the the current one, with an extra acceptance
   * criterium.
   */
  refine<N extends T>(predicate: (value: T) => value is N, msg: string): Decoder<N>;
  refine(predicate: (value: T) => boolean, msg: string): Decoder<T>;

  /**
   * Cast the return type of this read-only decoder to a narrower type. This is
   * useful to return "branded" types. This method has no runtime effect.
   */
  refineType<SubT extends T>(): Decoder<SubT>;

  /**
   * Build a new decoder from the current one, with an extra rejection
   * criterium.
   */
  reject(rejectFn: (value: T) => string | Annotation | null): Decoder<T>;

  /**
   * Build a new decoder from the current one, modifying its outputted value.
   */
  transform<V>(transformFn: (value: T) => V): Decoder<V>;

  /**
   * Build a new decoder from the current one, with a mutated error message
   * in case of a rejection.
   */
  describe(message: string): Decoder<T>;

  /**
   * Send the output of the current decoder into an acceptance function. The
   * given acceptance function will receive the output of the current decoder
   * as its input.
   *
   * > _**NOTE:** This is an advanced, low-level, API. It's not recommended
   * > to reach for this construct unless there is no other way. Most cases can
   * > be covered more elegantly by `.transform()`, `.refine()`, or `.pipe()`
   * > instead._
   */
  chain<V>(
    next: (
      blob: T,
      ok: (value: V) => DecodeResult<V>,
      err: (msg: string | Annotation) => DecodeResult<V>,
    ) => DecodeResult<V> | Decoder<V>,
  ): Decoder<V>;
  /** @deprecated To send the output into another decoder, use `.pipe()` instead. */
  // eslint-disable-next-line typescript/unified-signatures -- separate overload so only the decoder form is marked deprecated
  chain<V>(next: Decoder<V>): Decoder<V>;

  /**
   * Send the output of this decoder as input to another decoder.
   *
   * This can be useful to validate the results of a transform, i.e.:
   *
   *   string
   *     .transform((s) => s.split(','))
   *     .pipe(array(nonEmptyString))
   *
   * You can also conditionally pipe:
   *
   *   string.pipe((s) => s.startsWith('@') ? username : email)
   */
  pipe<V, D extends Decoder<V>>(next: D | ((blob: T) => D)): Decoder<DecoderType<D>>;

  /**
   * The Standard Schema interface for this decoder.
   */
  readonly '~standard': StandardSchemaV1.Props<unknown, T>;
}

/**
 * Helper type to return the output type of a Decoder.
 * It’s the inverse of Decoder<T>.
 *
 * You can use it at the type level:
 *
 *   DecoderType<Decoder<string>>    // string
 *   DecoderType<Decoder<number[]>>  // number[]
 *
 * Or on decoder instances, by using the `typeof` keyword:
 *
 *   DecoderType<typeof string>      // string
 *   DecoderType<typeof truthy>      // boolean
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DecoderType<D extends Decoder<any>> = D extends Decoder<infer T> ? T : never;

function noThrow<T, V>(fn: (value: T) => V): (blob: T) => DecodeResult<V> {
  return (t) => {
    try {
      const v = fn(t);
      return makeOk(v);
    } catch (e) {
      return makeErr(annotate(t, e instanceof Error ? e.message : String(e)));
    }
  };
}

function format(err: Annotation, formatter: Formatter): Error {
  const formatted = formatter(err);

  // Formatter functions may return a string or an error for convenience of
  // writing them. If it already returns an Error, return it unmodified. If
  // it returns a string, wrap it in a "Decoding error" instance.
  if (typeof formatted === 'string') {
    const err = new Error(`\n${formatted}`);
    err.name = 'Decoding error';
    return err;
  } else {
    return formatted;
  }
}

/**
 * Memoizes the `~standard` props. Kept outside the decoder rather than in
 * a field, so that `~standard` doesn't cost every decoder an extra slot.
 *
 * @internal
 */
const _standard = new WeakMap<object, StandardSchemaV1.Props<unknown, unknown>>();

/**
 * The implementation behind every `Decoder<T>`.
 *
 * @internal
 */
class DecoderImpl<T> implements Decoder<T> {
  /**
   * Verifies the untrusted/unknown input and either accepts or rejects it.
   *
   * Contrasted with `.verify()`, calls to `.decode()` will never fail and
   * instead return a result type.
   */
  readonly decode: (blob: unknown) => DecodeResult<T>;

  /**
   * Verifies the untrusted/unknown input and either accepts or rejects it.
   * When accepted, returns a value of type `T`. Otherwise fail with
   * a runtime error.
   */
  readonly verify: (blob: unknown, formatter?: Formatter) => T;

  /**
   * Verifies the untrusted/unknown input and either accepts or rejects it.
   * When accepted, returns the decoded `T` value directly. Otherwise returns
   * `undefined`.
   *
   * Use this when you're not interested in programmatically handling the
   * error message.
   */
  readonly value: (blob: unknown) => T | undefined;

  constructor(fn: AcceptanceFn<T>) {
    // Per-instance closures rather than methods, so they keep working when
    // detached from the decoder, e.g. `.filter(decoder.value)`
    const decode = (blob: unknown): DecodeResult<T> => {
      // Pass a more flexible error constructor to the acceptance function which
      // can also "just" error with a string, so users don't have to build the
      // Annotation object themselves in all custom Decoders.
      const makeFlexErr = (msg: Annotation | string) =>
        makeErr(isAnnotation(msg) ? msg : annotate(blob, msg));

      return fn(blob, makeOk, makeFlexErr);
    };

    const verify = (blob: unknown, formatter: Formatter = formatInline): T => {
      const result = decode(blob);
      if (result.ok) {
        return result.value;
      } else {
        throw format(result.error, formatter);
      }
    };

    const value = (blob: unknown): T | undefined => decode(blob).value;

    this.decode = decode;
    this.verify = verify;
    this.value = value;
  }

  /**
   * Accepts any value the given decoder accepts, and on success, will call
   * the given function **on the decoded result**. If the transformation
   * function throws an error, the whole decoder will fail using the error
   * message as the failure reason.
   */
  transform<V>(transformFn: (result: T) => V): Decoder<V> {
    return this.chain(noThrow(transformFn));
  }

  /**
   * Adds an extra predicate to a decoder. The new decoder is like the
   * original decoder, but only accepts values that also meet the
   * predicate.
   */
  refine<N extends T>(predicate: (value: T) => value is N, msg: string): Decoder<N>;
  refine(predicate: (value: T) => boolean, msg: string): Decoder<T>;
  refine(predicateFn: (value: T) => boolean, errmsg: string): Decoder<T> {
    return this.reject((value) =>
      predicateFn(value)
        ? // Don't reject
          null
        : // Reject with the given error message
          errmsg,
    );
  }

  /**
   * Cast the return type of this read-only decoder to a narrower type. This is
   * useful to return "branded" types. This method has no runtime effect.
   */
  refineType<SubT extends T>(): Decoder<SubT> {
    return this as unknown as Decoder<SubT>;
  }

  /**
   * Send the output of the current decoder into another decoder or acceptance
   * function. The given acceptance function will receive the output of the
   * current decoder as its input.
   *
   * > _**NOTE:** This is an advanced, low-level, API. It's not recommended
   * > to reach for this construct unless there is no other way. Most cases can
   * > be covered more elegantly by `.transform()`, `.refine()`, or `.pipe()`
   * > instead._
   */
  chain<V>(next: Next<V, T>): Decoder<V> {
    const decode = this.decode;
    return define((blob, ok, err) => {
      const r1 = decode(blob);
      if (!r1.ok) return r1; // Rejected

      const r2 = isDecoder(next) ? next : next(r1.value, ok, err);
      return isDecoder(r2) ? r2.decode(r1.value) : r2;
    });
  }

  /**
   * Send the output of this decoder as input to another decoder.
   *
   * This can be useful to validate the results of a transform, i.e.:
   *
   *   string
   *     .transform((s) => s.split(','))
   *     .pipe(array(nonEmptyString))
   *
   * You can also conditionally pipe:
   *
   *   string.pipe((s) => s.startsWith('@') ? username : email)
   */
  pipe<V, D extends Decoder<V>>(next: D | ((blob: T) => D)): Decoder<DecoderType<D>> {
    // Technically, .pipe() is just an alias of .chain(), but its signature is
    // more focused on the more convenient use case of working with Decoders
    // directly.
    return this.chain(next) as Decoder<DecoderType<D>>;
  }

  /**
   * Adds an extra predicate to a decoder. The new decoder is like the
   * original decoder, but only accepts values that aren't rejected by the
   * given function.
   *
   * The given function can return `null` to accept the decoded value, or
   * return a specific error message to reject.
   *
   * Unlike `.refine()`, you can use this function to return a dynamic error
   * message.
   */
  reject(rejectFn: (value: T) => string | Annotation | null): Decoder<T> {
    return this.chain((blob, ok, err) => {
      const errmsg = rejectFn(blob);
      return errmsg === null
        ? ok(blob)
        : err(typeof errmsg === 'string' ? annotate(blob, errmsg) : errmsg);
    });
  }

  /**
   * Uses the given decoder, but will use an alternative error message in
   * case it rejects. This can be used to simplify or shorten otherwise
   * long or low-level/technical errors.
   */
  describe(message: string): Decoder<T> {
    const decode = this.decode;
    return define((blob, _, err) => {
      // Decode using the given decoder...
      const result = decode(blob);
      if (result.ok) {
        return result;
      } else {
        // ...but in case of error, annotate this with the custom given
        // message instead
        return err(annotate(result.error, message));
      }
    });
  }

  /**
   * The Standard Schema interface for this decoder.
   */
  get '~standard'(): StandardSchemaV1.Props<unknown, T> {
    const memo = _standard.get(this) as StandardSchemaV1.Props<unknown, T> | undefined;
    if (memo !== undefined) return memo;

    const decode = this.decode;
    const props: StandardSchemaV1.Props<unknown, T> = {
      version: 1,
      vendor: 'decoders',
      validate: (blob) => {
        const result = decode(blob);
        if (result.ok) {
          return { value: result.value };
        } else {
          const issues = formatAsIssues(result.error);
          return { issues };
        }
      },
    };
    _standard.set(this, props);
    return props;
  }
}

// The binding can't be named `Decoder` (that's the public interface), but the
// class's name is what shows up in `console.log()` and `.constructor.name`
Object.defineProperty(DecoderImpl, 'name', { value: 'Decoder' });

/**
 * Defines a new `Decoder<T>`, by implementing a custom acceptance function.
 * The function receives three arguments:
 *
 * 1. `blob` - the raw/unknown input (aka your external data)
 * 2. `ok` - Call `ok(value)` to accept the input and return ``value``
 * 3. `err` - Call `err(message)` to reject the input with error ``message``
 *
 * The expected return value should be a `DecodeResult<T>`, which can be
 * obtained by returning the result of calling the provided `ok` or `err`
 * helper functions. Please note that `ok()` and `err()` don't perform side
 * effects! You'll need to _return_ those values.
 */
/* #__NO_SIDE_EFFECTS__ */
export function define<T>(fn: AcceptanceFn<T>): Decoder<T> {
  const decoder: Decoder<T> = new DecoderImpl(fn);
  return stamp(decoder);
}

/** @internal */
const kDecoderRegistry = Symbol.for('decoders.kDecoderRegistry');
// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
const _stamped: WeakSet<Decoder<unknown>> = ((globalThis as any)[kDecoderRegistry] ??=
  new WeakSet());

/** @internal */
function stamp<D extends Decoder<unknown>>(decoder: D): D {
  _stamped.add(decoder);
  return decoder;
}

/**
 * Returns whether the given value is a Decoder instance.
 */
/* #__NO_SIDE_EFFECTS__ */
export function isDecoder(value: unknown): value is Decoder<unknown> {
  return _stamped.has(value as Decoder<unknown>);
}
