// @flow

import * as Result from './Result';
import type { Decoder, Verifier } from './types';
import { makeDecoder } from './utils';

const verifyNumber: Verifier<number> = (blob: any) => {
    return typeof blob === 'number' ? Result.ok(blob) : Result.err('Must be number number');
};

const verifyFiniteNumber: Verifier<number> = (blob: any) =>
    Result.chain(verifyNumber(blob), n => (Number.isFinite(n) ? Result.ok(n) : Result.err('Number must be finite')));

/**
 * Decodes a boolean value.
 * Will throw a DecodeError if anything other than a boolean value is found.
 */
const _finnumdec = makeDecoder(verifyFiniteNumber);
const _numdec = makeDecoder(verifyNumber);
export function decodeNumber(allowInfinity: boolean = false): Decoder<number> {
    return allowInfinity ? _numdec : _finnumdec;
}
