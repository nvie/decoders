// @flow

import { Err, Ok } from 'lemons';

import type { Decoder, Verifier } from './types';
import { toDecoder, toVerifier } from './utils';

function verifyUndefined(): Verifier<void> {
    return (blob: any) => {
        return blob === undefined ? Ok(undefined) : Err('Must be undefined');
    };
}

function verifyNull(): Verifier<null> {
    return (blob: any) => {
        return blob === null ? Ok(null) : Err('Must be null');
    };
}

function verifyOneOf<T1, T2>(v1: Verifier<T1>, v2: Verifier<T2>): Verifier<T1 | T2> {
    return (blob: any) => {
        const r1 = v1(blob);
        return r1.dispatch(
            value => Ok(value),
            err1 => {
                const r2 = v2(blob);
                return r2.dispatch(value => Ok(value), err2 => Err('Error 1:\n' + err1 + '\n\n' + 'Error 2:\n' + err2));
            }
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
        const result = _undefOrNull(blob);
        return result.dispatch(
            () => Ok(undefined),
            () => {
                const r = verifier(blob);
                return r.dispatch(value => Ok(value), e => Err(e));
            }
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
