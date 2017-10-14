// @flow

import { DecodeError } from './asserts';
import * as Result from './Result';
import type { Decoder, Verifier } from './types';

/**
 * Will verify that the passed-in arbitrary object indeed is an Array,
 * and return it.  Otherwise throws a runtime error.
 */
export function asArray(blobs: any): Array<any> {
    if (!Array.isArray(blobs)) {
        throw DecodeError('Not an array', 'Expected an array', blobs);
    }

    return (blobs: Array<any>);
}

/**
 * Will verify that the passed-in arbitrary object indeed is an Object,
 * and return it.  Otherwise throws a runtime error.
 */
export function asObject(blob: any): Object {
    if (typeof blob !== 'object') {
        throw DecodeError('Not an object', 'Expected an object', blob);
    }

    return (blob: Object);
}

export function makeDecoder<T>(verifier: Verifier<T>): Decoder<T> {
    return (blob: any) => {
        const result = verifier(blob);
        return Result.dispatch(
            result,
            error => {
                throw new Error(error);
            },
            data => data
        );
    };
}
