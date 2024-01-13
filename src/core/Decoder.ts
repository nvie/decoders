import type { Annotation } from './annotate';
import { annotate, isAnnotation } from './annotate';
import type { Formatter } from './format';
import { formatInline } from './format';
import type { Result } from './Result';
import { err as makeErr, ok as makeOk } from './Result';

export type DecodeResult<T> = Result<T, Annotation>;

/**
 * A function taking a untrusted input, and returning a DecodeResult<T>. The
 * `ok()` and `err()` constructor functions are provided as the 2nd and 3rd
 * param. One of these should be called and its value returned.
 */
export type AcceptanceFn<T, InputT = unknown> = (
  blob: InputT,
  ok: (value: T) => DecodeResult<T>,
  err: (msg: string | Annotation) => DecodeResult<T>,
) => DecodeResult<T>;

type AcceptanceFn2<TOutput, TInput> =
  // XXX How to name this thing?
  (
    blob: TInput,
    ok: (value: TOutput) => DecodeResult<TOutput>,
    err: (msg: string | Annotation) => DecodeResult<TOutput>,
  ) => DecodeResult<TOutput> | Decoder<TOutput>;

// XXX Rename + document
type Next<TOutput, TInput = unknown> =
  | Decoder<TOutput> // or...
  | AcceptanceFn2<TOutput, TInput>;

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
   * Send the output of the current decoder into another acceptance function.
   * The given acceptance function will receive the output of the current
   * decoder as its input, making it partially trusted.
   *
   * This works similar to how you would `define()` a new decoder, except
   * that the ``blob`` param will now be ``T`` (a known type), rather than
   * ``unknown``. This will allow the function to make a stronger assumption
   * about its input and avoid re-refining inputs.
   *
   * > _**NOTE:** This is an advanced, low-level, API. It's not recommended
   * > to reach for this construct unless there is no other way. Most cases can
   * > be covered more elegantly by `.transform()` or `.refine()` instead._
   *
   * If it helps, you can think of `define(...)` as equivalent to
   * `unknown.then(...)`.
   */
  then<V>(next: Next<V, T>): Decoder<V>;

  /**
   * If the current (first) decoder accepts the input, sends its output into
   * the next (second) decoder, and return its results.
   *
   * This can be useful to validate the results of a previous transform, so in
   * a typical example, you do something like this:
   *
   *   string
   *     .transform(s => Number(s))
   *     .pipe(positiveInteger)
   *
   * Note that the given decoder does not know anything about the given
   * returned value. In the example above, for example, TypeScript knows that
   * the input to the `positiveInteger` decoder will be of type `number`, but
   * to the `positiveInteger` its input is completely opaque.
   */
  pipe<V>(next: Decoder<V>): Decoder<V>;

  /**
   * @internal
   * Chain together the current decoder with another acceptance function, but
   * also pass along the original input. Don't call this method directly.
   * You'll probably want to use the higher-level `select()` decoder instead.
   */
  peek<V>(next: AcceptanceFn<V, [unknown, T]>): Decoder<V>;
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
export function define<T>(fn: AcceptanceFn<T>): Decoder<T> {
  /**
   * Verifies the untrusted/unknown input and either accepts or rejects it.
   *
   * Contrasted with `.verify()`, calls to `.decode()` will never fail and
   * instead return a result type.
   */
  function decode(blob: unknown): DecodeResult<T> {
    return fn(blob, makeOk, (msg: Annotation | string) =>
      makeErr(isAnnotation(msg) ? msg : annotate(blob, msg)),
    );
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
   * Chain together the current decoder with another.
   *
   * > _**NOTE:** This is an advanced, low-level, API. It's not recommended
   * > to reach for this construct unless there is no other way. Most cases can
   * > be covered more elegantly by `.transform()` or `.refine()` instead._
   *
   * If the current decoder accepts an input, the resulting ``T`` value will
   * get passed into the given ``next`` acceptance function to further decide
   * whether or not the value should get accepted or rejected.
   *
   * This works similar to how you would `define()` a new decoder, except
   * that the ``blob`` param will now be ``T`` (a known type), rather than
   * ``unknown``. This will allow the function to make a stronger assumption
   * about its input and avoid re-refining inputs.
   *
   * If it helps, you can think of `define(...)` as equivalent to
   * `unknown.then(...)`.
   */
  function then<V>(next: Next<V, T>): Decoder<V> {
    // XXX Shorten!
    return define((blob, ok, err) => {
      const res1 = decode(blob);
      if (res1.ok) {
        const res2 = isDecoder(next)
          ? next // It's a decoder
          : next(res1.value, ok, err); // It's an acceptance function (which can also maybe return a decoder)
        if (isDecoder(res2)) {
          return res2.decode(res1.value);
        } else {
          return res2;
        }
      } else {
        return res1;
      }
    });
  }

  /**
   * If the current (first) decoder accepts the input, sends its output into
   * the next (second) decoder, and return its results.
   *
   * This can be useful to validate the results of a previous transform, so in
   * a typical example, you do something like this:
   *
   *   string
   *     .transform(s => Number(s))
   *     .pipe(positiveInteger)
   *
   * Note that the given decoder does not know anything about the given
   * returned value. In the example above, for example, TypeScript knows that
   * the input to the `positiveInteger` decoder will be of type `number`, but
   * to the `positiveInteger` its input is completely opaque.
   */
  function pipe<V>(next: Decoder<V>): Decoder<V> {
    // .pipe() is technically an alias of .then(), but has a simpler type signature
    return then(next);
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
    return then((blob, ok, err) => {
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
    });
  }

  /**
   * Chain together the current decoder with another acceptance function, but
   * also pass along the original input.
   *
   * This is like `.then()`, but instead of this function receiving just
   * the decoded result ``T``, it also receives the original input.
   *
   * This is an advanced, low-level, decoder. Don't call this method directly.
   * Use the `select()` decoder instead.
   */
  function peek<V>(next: AcceptanceFn<V, [unknown, T]>): Decoder<V> {
    return define((blob, ok, err) => {
      const result = decode(blob);
      return result.ok ? next([blob, result.value], ok, err) : result;
    });
  }

  return brand({
    verify,
    value,
    decode,
    transform,
    refine,
    reject,
    describe,
    then,
    pipe,
    peek,
  });
}

/** @internal */
const _register: WeakSet<Decoder<unknown>> = new WeakSet();

/** @internal */
function brand<A extends Decoder<unknown>>(ann: A): A {
  _register.add(ann);
  return ann;
}

/** @internal */
function isDecoder(thing: unknown): thing is Decoder<unknown> {
  return _register.has(thing as Decoder<unknown>);
}
