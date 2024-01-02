/**
 * Result <value> <error>
 *     = Ok <value>
 *     | Err <error>
 */
export type Ok<T> = {
  readonly ok: true;
  readonly value: T;
  readonly error?: never;
};

export type Err<E> = {
  readonly ok: false;
  readonly value?: never;
  readonly error: E;
};

export type Result<T, E> = Ok<T> | Err<E>;

/**
 * Create a new Result instance representing a successful computation.
 */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value, error: undefined };
}

/**
 * Create a new Result instance representing a failed computation.
 */
export function err<E>(error: E): Err<E> {
  return { ok: false, value: undefined, error };
}
