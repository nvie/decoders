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

export interface ReadonlyDecoder<T> extends Decoder<T> {
  /**
   * Whether this Decoder is guaranteed to only validate the given input
   * without modifying it.
   */
  readonly isReadonly: true;

  /**
   * Build a new decoder from the the current one, with an extra acceptance
   * criterium.
   */
  refine<N extends T>(
    predicate: (value: T) => value is N,
    msg: string,
  ): ReadonlyDecoder<N>;
  refine(predicate: (value: T) => boolean, msg: string): ReadonlyDecoder<T>;

  /**
   * Cast the return type of this read-only decoder to a more
   * specific type. This is useful to return "branded" types. This
   * method has no runtime effect.
   */
  brand<SubT>(): ReadonlyDecoder<SubT>;

  /**
   * Build a new decoder from the current one, with an extra rejection
   * criterium.
   */
  reject(rejectFn: (value: T) => string | Annotation | null): ReadonlyDecoder<T>;

  /**
   * Build a new decoder from the current one, with a mutated error message
   * in case of a rejection.
   */
  describe(message: string): ReadonlyDecoder<T>;
}

export interface Decoder<T> {
  /**
   * Whether this Decoder is guaranteed to only validate the given input
   * without modifying it.
   */
  readonly isReadonly: boolean;

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
   * Cast the return type of this decoder to a more specific type.
   * This is useful to return "branded" types. This method has no
   * runtime effect.
   */
  brand<SubT>(): Decoder<SubT>;

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
   * Send the output of the current decoder into another decoder or acceptance
   * function. The given acceptance function will receive the output of the
   * current decoder as its input.
   *
   * > _**NOTE:** This is an advanced, low-level, API. It's not recommended
   * > to reach for this construct unless there is no other way. Most cases can
   * > be covered more elegantly by `.transform()`, `.refine()`, or `.pipe()`
   * > instead._
   */
  then<V>(next: Next<V, T>, forceFlags?: Flags): Decoder<V>; // XXX This should not be public API

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
  '~standard': StandardSchemaV1.Props<unknown, T>;
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

export type Flags = {
  readonly readonly: boolean;
};

const DEFAULT_FLAGS: Flags = Object.freeze({ readonly: false });

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
export function define<T>(fn: AcceptanceFn<T>, flags = DEFAULT_FLAGS): Decoder<T> {
  /**
   * Verifies the untrusted/unknown input and either accepts or rejects it.
   *
   * Contrasted with `.verify()`, calls to `.decode()` will never fail and
   * instead return a result type.
   */
  function decode(blob: unknown): DecodeResult<T> {
    // Pass a more flexible error constructor to the acceptance function which
    // can also "just" error with a string, so users don't have to build the
    // Annotation object themselves in all custom Decoders.
    const makeFlexErr = (msg: Annotation | string) =>
      makeErr(isAnnotation(msg) ? msg : annotate(blob, msg));

    return fn(blob, makeOk, makeFlexErr);
  }

  /**
   * Verifies the untrusted/unknown input and either accepts or rejects it.
   * When accepted, returns a value of type `T`. Otherwise fail with
   * a runtime error.
   */
  function verify(blob: unknown, formatter: Formatter = formatInline): T {
    const result = decode(blob);
    if (result.ok) {
      return result.value;
    } else {
      throw format(result.error, formatter);
    }
  }

  /**
   * Verifies the untrusted/unknown input and either accepts or rejects it.
   * When accepted, returns the decoded `T` value directly. Otherwise returns
   * `undefined`.
   *
   * Use this when you're not interested in programmatically handling the
   * error message.
   */
  function value(blob: unknown): T | undefined {
    return decode(blob).value;
  }

  /**
   * Accepts any value the given decoder accepts, and on success, will call
   * the given function **on the decoded result**. If the transformation
   * function throws an error, the whole decoder will fail using the error
   * message as the failure reason.
   */
  function transform<V>(transformFn: (result: T) => V): Decoder<V> {
    return then(noThrow(transformFn));
  }

  /**
   * Adds an extra predicate to a decoder. The new decoder is like the
   * original decoder, but only accepts values that also meet the
   * predicate.
   */
  function refine(predicateFn: (value: T) => boolean, errmsg: string): Decoder<T> {
    return reject((value) =>
      predicateFn(value)
        ? // Don't reject
          null
        : // Reject with the given error message
          errmsg,
    );
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
  function then<V>(next: Next<V, T>, forceFlags?: Flags): Decoder<V> {
    // Compute flags for the resulting decoder. If the provided value is
    // a function, it's impossible to statically know if it's going to be
    // a readonly decoder or not.
    const newFlags = forceFlags ?? {
      readonly: flags.readonly && isDecoder(next) && next.isReadonly,
    };

    return define(
      (blob, ok, err) => {
        const r1 = decode(blob);
        if (!r1.ok) return r1; // Rejected

        const r2 = isDecoder(next) ? next : next(r1.value, ok, err);
        return isDecoder(r2) ? r2.decode(r1.value) : r2;
      },

      newFlags,
    );
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
  function pipe<V, D extends Decoder<V>>(
    next: D | ((blob: T) => D),
  ): Decoder<DecoderType<D>> {
    // Technically, .pipe() is just an alias of .then(), but its signature is
    // more focused on the more convenient use case of working with Decoders
    // directly.
    return then(next) as Decoder<DecoderType<D>>;
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
  function reject(rejectFn: (value: T) => string | Annotation | null): Decoder<T> {
    return then(
      (blob, ok, err) => {
        const errmsg = rejectFn(blob);
        return errmsg === null
          ? ok(blob)
          : err(typeof errmsg === 'string' ? annotate(blob, errmsg) : errmsg);
      },

      // XXX I don't like this forcing of the flags here.
      // XXX The internal helper we really want to call here is like
      // XXX a .thenReadonly(). Think about a better API.
      flags,
    );
  }

  /**
   * Uses the given decoder, but will use an alternative error message in
   * case it rejects. This can be used to simplify or shorten otherwise
   * long or low-level/technical errors.
   */
  function describe(message: string): Decoder<T> {
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
    }, flags);
  }

  /**
   * Cast the return type of this decoder to a more specific type.
   * This is useful to return "branded" types. This method has no
   * runtime effect.
   */
  function brand<SubT>(): Decoder<SubT> {
    return self as any;
  }

  const self = register({
    get isReadonly(): boolean {
      return flags.readonly;
    },
    verify,
    value,
    decode,
    transform,
    refine,
    reject,
    describe,
    brand,
    then,
    pipe,
    '~standard': {
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
    },
  });
  return self;
}

/**
 * Defines a new read-only decoder. A read-only decoder is one that guarantees
 * to validate the given input without modifying it, and returning its input
 * value unchanged (if it's accepted).
 */
export function defineReadonly<T>(
  predicate: (blob: unknown) => blob is T,
  message: string,
): ReadonlyDecoder<T> {
  const flags: Flags = { readonly: true };
  return define(
    (blob, ok, err) => (predicate(blob) ? ok(blob) : err(message)),
    flags,
  ) as ReadonlyDecoder<T>;
}

/**
 * Ensures that the given decoder will (recursively) be read-only at runtime.
 */
export function readonly<T>(decoder: Decoder<T>): ReadonlyDecoder<T> {
  if (!decoder.isReadonly) {
    const err = new Error('Decoder setup error: this decoder is required to be readonly');
    Error.captureStackTrace(err, readonly);
    throw err;
  }
  return decoder as ReadonlyDecoder<T>;
}

/** @internal */
const kDecoderRegistry = Symbol.for('decoders.kDecoderRegistry');
// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
const _register: WeakSet<Decoder<unknown>> = ((globalThis as any)[kDecoderRegistry] ??=
  new WeakSet());

/** @internal */
function register<D extends Decoder<unknown>>(decoder: D): D {
  _register.add(decoder);
  return decoder;
}

/** @internal */
function isDecoder(thing: unknown): thing is Decoder<unknown> {
  return _register.has(thing as Decoder<unknown>);
}
