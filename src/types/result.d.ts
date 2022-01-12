export interface Ok<T> {
    ok: true;
    value: T;
    error: undefined;
}

export interface Err<E> {
    ok: false;
    value: undefined;
    error: E;
}

export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T>;
export function err<E>(error: E): Err<E>;
