export interface Ok<T> {
    ok: true;
    value: T;
    error?: never;
}

export interface Err<E> {
    ok: false;
    error: E;
    value?: never;
}

export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T>;
export function err<E>(error: E): Err<E>;
