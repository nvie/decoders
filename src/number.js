// @flow

import { Ok } from 'lemons';

import type { Verifier } from './types';
import { makeErr } from './asserts';

import { compose, predicate } from './utils';

export const anyNumber: Verifier<number> = (blob: any) => {
    return typeof blob === 'number' && !Number.isNaN(blob) ? Ok(blob) : makeErr('Must be number');
};

export const number: Verifier<number> = compose(anyNumber, predicate(Number.isFinite, 'Number must be finite'));
export const positiveNumber: Verifier<number> = compose(number, predicate(n => n >= 0, 'Number must be positive'));

// Integers
export const integer: Verifier<number> = compose(number, predicate(Number.isInteger, 'Number must be an integer'));
export const positiveInteger: Verifier<number> = compose(
    number,
    predicate(n => n >= 0 && Number.isInteger(n), 'Number must be an integer')
);
