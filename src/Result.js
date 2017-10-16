// @flow

// prettier-ignore
export type ResultT<T> =
    | { Result: 'Err', msg: string }
    | { Result: 'Ok', value: T };

export function err<T>(msg: string): ResultT<T> {
    return { Result: 'Err', msg };
}

export function ok<T>(value: T): ResultT<T> {
    return { Result: 'Ok', value };
}

// prettier-ignore
export function dispatch<T, O>(
    result: ResultT<T>,
    err: (msg: string) => O,
    ok: (value: T) => O,
): O {
    switch (result.Result) {
        case 'Err':
            return err(result.msg);
        case 'Ok':
            return ok(result.value);
        default:
            /* istanbul ignore next */
            throw new Error('Unhandled case -- should never happen');
    }
}

/**
 * Chain together a sequence of computations that may fail.
 */
export function andThen<A, B>(result: ResultT<A>, callback: A => ResultT<B>): ResultT<B> {
    return result.Result === 'Ok' ? callback(result.value) : result;
}

export const chain = andThen;
