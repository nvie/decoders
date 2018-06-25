// @flow strict

import { undefined_ } from './constants';
import { either } from './either';
import { maybe } from './maybe';
import type { Decoder } from './types';
import { map } from './utils';

/**
 * Builds a Decoder that returns Ok for either `undefined` or `T` values,
 * given a Decoder for `T`.  Err otherwise.
 */
export function optional<T>(decoder: Decoder<T>, allowNull: boolean = false): Decoder<void | T> {
    if (allowNull) {
        // eslint-disable-next-line no-console
        console.warn('allowNull optional param is deprecated.  Prefer using maybe(x) over optional(x, true)'); // eslint-disable-line no-undef
        return map(maybe(decoder), x => (x === null || x === undefined ? undefined : x));
    }
    return either(undefined_, decoder);
}
