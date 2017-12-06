// @flow

import { pojo } from './object';
import type { Decoder } from './types';
import { compose, predicate } from './utils';

export const date: Decoder<Date> = compose(
    pojo,

    // This uses duck typing to check whether this is a Date instance.  Since
    // `instanceof` checks are unreliable across stack frames (that information
    // might get lost by the JS runtime), we'll have to reside to either this
    // duck typing, or use something like:
    //
    //     Object.prototype.toString.call(date) === '[object Date]'
    //
    // But in this case, I chose the faster check.
    predicate(o => !!o && typeof o.getMonth === 'function', 'Must be a Date')
);
