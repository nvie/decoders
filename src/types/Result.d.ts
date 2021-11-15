export interface OkResult<T> {
    readonly type: 'ok';
    readonly value: T;
}

export interface ErrResult<E> {
    readonly type: 'err';
    readonly error: E;
}

export type Result<T, E> = OkResult<T> | ErrResult<E>;

export function Ok<T>(value: T): { type: 'ok'; value: T };
export function Err<E>(error: E): { type: 'err'; error: E };
export function toString<T, E>(result: Result<T, E>): string;
export function isOk(result: Result<unknown, unknown>): boolean;
export function isErr(result: Result<unknown, unknown>): boolean;
export function withDefault<T>(result: Result<T, unknown>, defaultValue: T): T;
export function value<T>(result: Result<T, unknown>): void | T;
export function errValue<E>(result: Result<unknown, E>): void | E;
export function unwrap<T>(result: Result<T, unknown>): T;
export function expect<T, E>(result: Result<T, E>, message: string | Error): T;
export function dispatch<T, E, O>(
    result: Result<T, E>,
    okCallback: (value: T) => O,
    errCallback: (error: E) => O,
): O;
export function andThen<T, E, V>(
    result: Result<T, E>,
    callback: (value: T) => Result<V, E>,
): Result<V, E>;
export function map<T, E, T2>(result: Result<T, E>, mapper: (T) => T2): Result<T2, E>;
export function mapError<T, E, E2>(
    result: Result<T, E>,
    mapper: (error: E) => E2,
): Result<T, E2>;
