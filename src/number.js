// @flow

import { Ok } from 'lemons';

import type { Verifier } from './types';
import { makeErr } from './asserts';

export const anyNumber: Verifier<number> = (blob: any) => {
    return typeof blob === 'number' && !Number.isNaN(blob) ? Ok(blob) : makeErr('Must be number');
};

export const number: Verifier<number> = (blob: any) => {
    return anyNumber(blob).andThen(n => (Number.isFinite(n) ? Ok(n) : makeErr('Number must be finite')));
};
