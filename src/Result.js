// @flow strict

/**
 * Result <value> <error>
 *     = Ok <value>
 *     | Err <error>
 */

// prettier-ignore
export type Result<T, E> =
    | {| type: 'ok',  value: T |}
    | {| type: 'err', error: E |}

/**
 * Create a new Result instance representing a successful computation.
 */
export function Ok<T, E>(value: T): Result<T, E> {
    return { type: 'ok', value };
}

/**
 * Create a new Result instance representing a failed computation.
 */
export function Err<T, E>(error: E): Result<T, E> {
    return { type: 'err', error };
}

export function toString<T, E>(r: Result<T, E>): string {
    return r.type === 'ok' ? `Ok(${String(r.value)})` : `Err(${String(r.error)})`;
}

export function isOk<T, E>(r: Result<T, E>): boolean {
    return r.type === 'ok';
}

export function isErr<T, E>(r: Result<T, E>): boolean {
    return r.type === 'err';
}

export function withDefault<T, E>(r: Result<T, E>, defaultValue: T): T {
    return r.type === 'ok' ? r.value : defaultValue;
}

export function value<T, E>(r: Result<T, E>): void | T {
    return r.type === 'ok' ? r.value : undefined;
}

export function errValue<T, E>(r: Result<T, E>): void | E {
    return r.type === 'err' ? r.error : undefined;
}

/**
 * Unwrap the value from this Result instance if this is an "Ok" result.
 * Otherwise, will throw the "Err" error via a runtime exception.
 */
export function unwrap<T, E>(r: Result<T, E>): T {
    if (r.type === 'ok') {
        return r.value;
    } else {
        throw r.error;
    }
}

export function expect<T, E>(r: Result<T, E>, message: string | Error): T {
    if (r.type === 'ok') {
        return r.value;
    } else {
        throw message instanceof Error ? message : new Error(message);
    }
}

export function dispatch<T, E, O>(
    r: Result<T, E>,
    okCallback: (T) => O,
    errCallback: (E) => O,
): O {
    return r.type === 'ok' ? okCallback(r.value) : errCallback(r.error);
}

/**
 * Chain together a sequence of computations that may fail.
 */
export function andThen<T, E, V>(
    r: Result<T, E>,
    callback: (T) => Result<V, E>,
): Result<V, E> {
    return r.type === 'ok' ? callback(r.value) : Err(r.error);
}

/**
 * Transform an Ok result.  If the result is an Err, the same error value
 * will propagate through.
 */
export function map<T, E, T2>(r: Result<T, E>, mapper: (T) => T2): Result<T2, E> {
    return r.type === 'ok' ? Ok(mapper(r.value)) : Err(r.error);
}

/**
 * Transform an Err value.  If the result is an Ok, this is a no-op.
 * Useful when for example the errors has too much information.
 */
export function mapError<T, E, E2>(r: Result<T, E>, mapper: (E) => E2): Result<T, E2> {
    return r.type === 'ok' ? Ok(r.value) : Err(mapper(r.error));
}
