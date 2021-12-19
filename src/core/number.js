// @flow strict

import { annotate } from '../annotate';
import { err, ok } from '../result';
import { predicate } from './composition';
import type { Decoder } from '../_types';

const anyNumber: Decoder<number> = (blob: mixed) => {
    return typeof blob === 'number' && !Number.isNaN(blob)
        ? ok(blob)
        : err(annotate(blob, 'Must be number'));
};

const isInteger = (n: number) => Number.isInteger(n);
const isFinite = (n: number) => Number.isFinite(n);

export const number: Decoder<number> = predicate(
    anyNumber,
    isFinite,
    'Number must be finite',
);

export const positiveNumber: Decoder<number> = predicate(
    number,
    (n) => n >= 0,
    'Number must be positive',
);

// Integers
export const integer: Decoder<number> = predicate(
    number,
    isInteger,
    'Number must be an integer',
);

export const positiveInteger: Decoder<number> = predicate(
    integer,
    (n) => n >= 0,
    'Number must be positive',
);
