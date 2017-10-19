// @flow

import { Err, Ok } from 'lemons';

import type { Decoder, Verifier } from './types';
import { toDecoder } from './utils';
import { DecodeError } from './asserts';

const verifyBoolean: Verifier<boolean> = (blob: any) => {
    return typeof blob === 'boolean' ? Ok(blob) : Err(DecodeError('Must be boolean', '', blob));
};

/**
 * Decodes a boolean value.
 * Will throw a DecodeError if anything other than a boolean value is found.
 */
const singleton = toDecoder(verifyBoolean);
export function decodeBoolean(): Decoder<boolean> {
    return singleton;
}
