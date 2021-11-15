// @flow strict

/**
 * Result error value
 *     = Ok value
 *     | Err error
 */

const Ok = 'Ok';
const Err = 'Err';

// prettier-ignore
opaque type $ResultT<E, T> =
    | {| type: typeof Ok, value: T |}
    | {| type: typeof Err, error: E |}

/**
 * Represents a union type that's either a legit value or an error:
 *
 *     Result error value
 *         = Ok value
 *         | Err error
 *
 */
class Result<E, T> {
    _r: $ResultT<E, T>;

    /**
     * **Do not call this constructor directly!**  Use either `Result.ok()` or
     * `Result.err()` to construct a new Result instance.
     */
    constructor(r: $ResultT<E, T>) {
        this._r = r;
    }

    /**
     * Create a new Result instance representing a successful computation.
     */
    static ok(value: T): Result<E, T> {
        return new Result({ type: Ok, value });
    }

    /**
     * Create a new Result instance representing a failed computation.
     */
    static err(error: E): Result<E, T> {
        return new Result({ type: Err, error });
    }

    toString(): string {
        const r = this._r;
        return r.type === Ok ? `Ok(${String(r.value)})` : `Err(${String(r.error)})`;
    }

    isOk(): boolean {
        return this._r.type === Ok;
    }

    isErr(): boolean {
        return this._r.type === Err;
    }

    withDefault(defaultValue: T): T {
        const r = this._r;
        return r.type === Ok ? r.value : defaultValue;
    }

    value(): void | T {
        const r = this._r;
        return r.type === Ok ? r.value : undefined;
    }

    errValue(): void | E {
        const r = this._r;
        return r.type === Err ? r.error : undefined;
    }

    /**
     * Unwrap the value from this Result instance if this is an "Ok" result.
     * Otherwise, will throw the "Err" error via a runtime exception.
     */
    unwrap(): T {
        const r = this._r;
        if (r.type === Ok) {
            return r.value;
        } else {
            throw r.error;
        }
    }

    expect(message: string | Error): T {
        const r = this._r;
        if (r.type === Ok) {
            return r.value;
        } else {
            throw message instanceof Error ? message : new Error(message);
        }
    }

    dispatch<O>(okCallback: (T) => O, errCallback: (E) => O): O {
        const r = this._r;
        return r.type === Ok ? okCallback(r.value) : errCallback(r.error);
    }

    /**
     * Chain together a sequence of computations that may fail.
     */
    andThen<V>(callback: (T) => Result<E, V>): Result<E, V> {
        const r = this._r;
        return r.type === Ok ? callback(r.value) : Result.err(r.error);
    }

    /**
     * Transform an Ok result.  If the result is an Err, the same error value
     * will propagate through.
     */
    map<T2>(mapper: (T) => T2): Result<E, T2> {
        const r: $ResultT<E, T> = this._r;
        return r.type === Ok ? Result.ok(mapper(r.value)) : Result.err(r.error);
    }

    /**
     * Transform an Err value.  If the result is an Ok, this is a no-op.
     * Useful when for example the errors has too much information.
     */
    mapError<E2>(mapper: (E) => E2): Result<E2, T> {
        const r = this._r;
        return r.type === Ok ? Result.ok(r.value) : Result.err(mapper(r.error));
    }
}

const _Ok = <E, T>(value: T): Result<E, T> => Result.ok(value);
const _Err = <E, T>(error: E): Result<E, T> => Result.err(error);

// prettier-ignore
export {
    Result,
    _Ok as Ok,
    _Err as Err,
};
