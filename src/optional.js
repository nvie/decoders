// @flow

import * as Result from './Result';
import type { ResultT } from './Result';
import type { Decoder, Verifier } from './types';
import { toDecoder, toVerifier } from './utils';

function verifyUndefined(): Verifier<void> {
    return (blob: any) => {
        return blob === undefined ? Result.ok(undefined) : Result.err('Must be undefined');
    };
}

function verifyNull(): Verifier<null> {
    return (blob: any) => {
        return blob === null ? Result.ok(null) : Result.err('Must be null');
    };
}

function verifyOneOf<T1, T2>(v1: Verifier<T1>, v2: Verifier<T2>): Verifier<T1 | T2> {
    return (blob: any) => {
        const r1: ResultT<T1> = v1(blob);
        return Result.dispatch(
            r1,
            err1 => {
                const r2: ResultT<T2> = v2(blob);
                return Result.dispatch(
                    r2,
                    err2 => Result.err('Error 1:\n' + err1 + '\n\n' + 'Error 2:\n' + err2),
                    value => Result.ok(value)
                );
            },
            value => Result.ok(value)
        );
    };
}

function verifyOptional<T>(verifier: Verifier<T>): Verifier<void | T> {
    // return (blob: any) => {
    //     if (blob !== undefined) {
    //         return Result.dispatch(verifier(blob), e => Result.err(e), v => Result.ok(v));
    //     } else {
    //         return Result.ok(undefined);
    //     }
    // };
    return verifyOneOf(verifyUndefined(), verifier);
}

const _undefOrNull = verifyOneOf(verifyUndefined(), verifyNull());

function verifyOptionalWithNull<T>(verifier: Verifier<T>): Verifier<void | T> {
    return (blob: any) => {
        return Result.dispatch(
            _undefOrNull(blob),
            () => {
                const r: ResultT<T> = verifier(blob);
                return Result.dispatch(r, err => Result.err(err), value => Result.ok(value));
            },
            () => Result.ok(undefined)
        );
    };
}

/**
 * Will wrap the given decoder, making it accept undefined, too.
 */
export function optional<T>(decoder: Decoder<T>, allowNull: boolean = false): Decoder<void | T> {
    const parentVerifier: Verifier<T> = toVerifier(decoder);
    const verifier: Verifier<void | T> = allowNull
        ? verifyOptionalWithNull(parentVerifier)
        : verifyOptional(parentVerifier);
    return toDecoder(verifier);
}
