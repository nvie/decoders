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
 * Like .and(), aka &&, but the second argument gets evaluated lazily only if
 * the first result is an Ok result. If so, it has access to the Ok value from
 * the first argument.
 */
export function andThen<T1, E, T2>(
    r: Result<T1, E>,
    callback: (value: T1) => Result<T2, E>,
): Result<T2, E> {
    return r.ok ? callback(r.value) : r;
}
