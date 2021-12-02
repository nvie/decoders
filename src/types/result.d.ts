declare module 'decoders/result' {
    export interface Ok<T> {
        readonly type: 'ok';
        readonly value: T;
    }

    export interface Err<E> {
        readonly type: 'err';
        readonly error: E;
    }

    export type Result<T, E> = Ok<T> | Err<E>;

    export function ok<T>(value: T): Ok<T>;
    export function err<E>(error: E): Err<E>;
    export function toString(result: Result<unknown, unknown>): string;
    export function isOk(result: Result<unknown, unknown>): boolean;
    export function isErr(result: Result<unknown, unknown>): boolean;
    export function withDefault<T>(result: Result<T, unknown>, defaultValue: T): T;
    export function value<T>(result: Result<T, unknown>): void | T;
    export function errValue<E>(result: Result<unknown, E>): void | E;
    export function unwrap<T>(result: Result<T, unknown>): T;
    export function expect<T>(result: Result<T, unknown>, message: string | Error): T;
    export function dispatch<T, E, O>(
        result: Result<T, E>,
        okCallback: (value: T) => O,
        errCallback: (error: E) => O,
    ): O;
    export function andThen<T, E, V>(
        result: Result<T, E>,
        callback: (value: T) => Result<V, E>,
    ): Result<V, E>;
    export function map<T, E, T2>(
        result: Result<T, E>,
        mapper: (value: T) => T2,
    ): Result<T2, E>;
    export function mapError<T, E, E2>(
        result: Result<T, E>,
        mapper: (error: E) => E2,
    ): Result<T, E2>;
}
