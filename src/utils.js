// @flow

import { DecodeError } from './asserts';
import type { Decoder } from './types';

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

/**
 * Create a decoder that, when decoding A works, will allow you to generate a decoder B on
 * the fly, based on the parsed-out value of A, then continue feeding that decoder the
 * original blob.
 */
export function map<T, V>(decoder: Decoder<T>, mapper: T => V): Decoder<V> {
    return (blob: any) => {
        let value: T = decoder(blob);
        return mapper(value);
    };
}
