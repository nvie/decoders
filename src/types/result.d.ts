export interface Ok<T> {
    type: 'ok';
    value: T;
    error: undefined;
}

export interface Err<E> {
    type: 'err';
    value: undefined;
    error: E;
}

export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T>;
export function err<E>(error: E): Err<E>;
export function unwrap<T>(result: Result<T, unknown>): T;
export function expect<T>(result: Result<T, unknown>, message: string | Error): T;
export function dispatch<T, E, O>(
    result: Result<T, E>,
    okCallback: (value: T) => O,
    errCallback: (error: E) => O,
): O;
export function andThen<T, E, T2>(
    result1: Result<T, E>,
    lazyResult2: (value: T) => Result<T2, E>,
): Result<T2, E>;
export function orElse<T, E, E2>(
    result1: Result<T, E>,
    lazyResult2: (errValue: E) => Result<T, E2>,
): Result<T, E2>;
export function mapOk<T, E, T2>(
    result: Result<T, E>,
    mapper: (value: T) => T2,
): Result<T2, E>;
export function mapError<T, E, E2>(
    result: Result<T, E>,
    mapper: (error: E) => E2,
): Result<T, E2>;
