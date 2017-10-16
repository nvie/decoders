// @flow

import * as Result from './Result';
import type { Decoder, Verifier } from './types';
import { toDecoder } from './utils';

const verifyNumber: Verifier<number> = (blob: any) => {
    if (typeof blob !== 'number') {
        return Result.err('Must be number');
    } else if (Number.isNaN(blob)) {
        return Result.err('Must be number, got NaN');
    } else {
        return Result.ok(blob);
    }
};

const verifyFiniteNumber: Verifier<number> = (blob: any) => {
    return Result.chain(
        verifyNumber(blob),
        n => (Number.isFinite(n) ? Result.ok(n) : Result.err('Number must be finite'))
    );
};

/**
 * Decodes a boolean value.
 * Will throw a DecodeError if anything other than a boolean value is found.
 */
const _finnumdec = toDecoder(verifyFiniteNumber);
const _numdec = toDecoder(verifyNumber);
export function decodeNumber(allowInfinity: boolean = false): Decoder<number> {
    return allowInfinity ? _numdec : _finnumdec;
}
