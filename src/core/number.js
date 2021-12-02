// @flow strict

import * as Result from '../result';
import { annotate } from '../annotate';
import { compose, predicate } from './composition';
import type { Decoder } from '../_types';

const anyNumber: Decoder<number> = (blob: mixed) => {
    return typeof blob === 'number' && !Number.isNaN(blob)
        ? Result.ok(blob)
        : Result.err(annotate(blob, 'Must be number'));
};

const isInteger = (n: number) => Number.isInteger(n);
const isFinite = (n: number) => Number.isFinite(n);

export const number: Decoder<number> = compose(
    anyNumber,
    predicate(isFinite, 'Number must be finite'),
);
export const positiveNumber: Decoder<number> = compose(
    number,
    predicate((n) => n >= 0, 'Number must be positive'),
);

// Integers
export const integer: Decoder<number> = compose(
    number,
    predicate(isInteger, 'Number must be an integer'),
);
export const positiveInteger: Decoder<number> = compose(
    integer,
    predicate((n) => n >= 0, 'Number must be positive'),
);
