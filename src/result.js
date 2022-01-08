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
 * Unwrap the value from this Result instance if this is an "Ok" result.
 * Otherwise, will throw the "Err" error via a runtime exception.
 */
export function unwrap<T>(r: Result<T, mixed>): T {
    if (r.ok) {
        return r.value;
    } else {
        throw r.error;
    }
}

export function expect<T>(r: Result<T, mixed>, message: string | Error): T {
    if (r.ok) {
        return r.value;
    } else {
        throw message instanceof Error ? message : new Error(message);
    }
}

export function dispatch<T, E, O>(
    r: Result<T, E>,
    okCallback: (value: T) => O,
    errCallback: (error: E) => O,
): O {
    return r.ok ? okCallback(r.value) : errCallback(r.error);
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

/**
 * Like .or(), aka ||, but the second argument gets evaluated lazily only if
 * the first result is an Err result. If so, it has access to the Err value
 * from the first argument.
 */
export function orElse<T, E1, E2>(
    r: Result<T, E1>,
    callback: (errValue: E1) => Result<T, E2>,
): Result<T, E2> {
    return r.ok ? r : callback(r.error);
}

/**
 * Transform an Ok result. Will not touch Err results.
 */
export function mapOk<T, E, T2>(r: Result<T, E>, mapFn: (value: T) => T2): Result<T2, E> {
    return r.ok ? ok(mapFn(r.value)) : r;
}

/**
 * Transform an Err value. Will not touch Ok results.
 */
export function mapError<T, E, E2>(
    r: Result<T, E>,
    mapFn: (error: E) => E2,
): Result<T, E2> {
    return r.ok ? r : err(mapFn(r.error));
}
