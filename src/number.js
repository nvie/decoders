// @flow

import { Err, Ok } from 'lemons';

import type { Decoder, Verifier } from './types';
import { toDecoder } from './utils';

const verifyNumber: Verifier<number> = (blob: any) => {
    if (typeof blob !== 'number') {
        return Err('Must be number');
    } else if (Number.isNaN(blob)) {
        return Err('Must be number, got NaN');
    } else {
        return Ok(blob);
    }
};

const verifyFiniteNumber: Verifier<number> = (blob: any) => {
    const result = verifyNumber(blob);
    return result.andThen(n => (Number.isFinite(n) ? Ok(n) : Err('Number must be finite')));
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
