// @flow

import { null_ } from './constants';
import { either } from './either';
import type { Decoder } from './types';

export function nullable<T>(decoder: Decoder<T>): Decoder<null | T> {
    return either(null_, decoder);
}
