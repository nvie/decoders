// @flow

import type { Decoder } from './types';

/**
 * Decodes any hardcoded value, without looking at the input data.
 */
export function decodeValue<T>(value: T): Decoder<T> {
    return () => {
        return value;
    };
}
