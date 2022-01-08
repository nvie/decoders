// @flow strict

/**
 * Result <value> <error>
 *     = Ok <value>
 *     | Err <error>
 */

type Ok<+T> = {| +ok: true, +value: T, +error: void |};
type Err<+E> = {| +ok: false, +value: void, +error: E |};

export type Result<+T, +E> = Ok<T> | Err<E>;

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

/**
 * Chain together multiple results. If the first result is ok, return the
 * result of invoking the callback with that first value.
 * The callback is only invoked lazily if the first result is an Ok result.
 * If so, it has
 * access to the Ok value from the first argument.
 */
export function andThen<A, B, E>(
    r: Result<A, E>,
    callback: (value: A) => Result<B, E>,
): Result<B, E> {
    return r.ok ? callback(r.value) : r;
}
