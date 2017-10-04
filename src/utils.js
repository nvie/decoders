// @flow

import { DecodeError } from './asserts';

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
