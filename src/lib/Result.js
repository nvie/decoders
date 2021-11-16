// @flow strict

/**
 * Result <value> <error>
 *     = Ok <value>
 *     | Err <error>
 */

type Ok<+T> = {| +type: 'ok', +value: T |};
type Err<+E> = {| +type: 'err', +error: E |};

export type Result<+T, +E> = Ok<T> | Err<E>;

/**
 * Create a new Result instance representing a successful computation.
 */
export function ok<T>(value: T): Ok<T> {
    return { type: 'ok', value };
}

/**
 * Create a new Result instance representing a failed computation.
 */
export function err<E>(error: E): Err<E> {
    return { type: 'err', error };
}

export function toString(result: Result<mixed, mixed>): string {
    return result.type === 'ok'
        ? `Ok(${String(result.value)})`
        : `Err(${String(result.error)})`;
}

export function isOk(result: Result<mixed, mixed>): boolean {
    return result.type === 'ok';
}

export function isErr(result: Result<mixed, mixed>): boolean {
    return result.type === 'err';
}

export function withDefault<T>(result: Result<T, mixed>, defaultValue: T): T {
    return result.type === 'ok' ? result.value : defaultValue;
}

export function value<T>(result: Result<T, mixed>): void | T {
    return result.type === 'ok' ? result.value : undefined;
}

export function errValue<E>(result: Result<mixed, E>): void | E {
    return result.type === 'err' ? result.error : undefined;
}

/**
 * Unwrap the value from this Result instance if this is an "Ok" result.
 * Otherwise, will throw the "Err" error via a runtime exception.
 */
export function unwrap<T>(result: Result<T, mixed>): T {
    if (result.type === 'ok') {
        return result.value;
    } else {
        throw result.error;
    }
}

export function expect<T>(result: Result<T, mixed>, message: string | Error): T {
    if (result.type === 'ok') {
        return result.value;
    } else {
        throw message instanceof Error ? message : new Error(message);
    }
}

export function dispatch<T, E, O>(
    result: Result<T, E>,
    okCallback: (value: T) => O,
    errCallback: (error: E) => O,
): O {
    return result.type === 'ok' ? okCallback(result.value) : errCallback(result.error);
}

/**
 * Chain together a sequence of computations that may fail.
 */
export function andThen<T, E, V>(
    result: Result<T, E>,
    callback: (value: T) => Result<V, E>,
): Result<V, E> {
    return result.type === 'ok' ? callback(result.value) : err(result.error);
}

/**
 * Transform an Ok result.  If the result is an Err, the same error value
 * will propagate through.
 */
export function map<T, E, T2>(
    result: Result<T, E>,
    mapper: (value: T) => T2,
): Result<T2, E> {
    return result.type === 'ok' ? ok(mapper(result.value)) : result;
}

/**
 * Transform an Err value.  If the result is an Ok, this is a no-op.
 * Useful when for example the errors has too much information.
 */
export function mapError<T, E, E2>(
    result: Result<T, E>,
    mapper: (error: E) => E2,
): Result<T, E2> {
    return result.type === 'ok' ? result : err(mapper(result.error));
}
