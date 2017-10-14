// @flow

import * as Result from './Result';
import type { Decoder, Verifier } from './types';
import { makeDecoder } from './utils';

const verifyBoolean: Verifier<boolean> = (blob: any) => {
    return typeof blob === 'boolean' ? Result.ok(blob) : Result.err('Must be boolean');
};

/**
 * Decodes a boolean value.
 * Will throw a DecodeError if anything other than a boolean value is found.
 */
const singleton = makeDecoder(verifyBoolean);
export function decodeBoolean(): Decoder<boolean> {
    return singleton;
}
