// @flow strict

import { annotate } from 'debrief';
import { Err, Ok } from 'lemons/Result';

import type { Decoder } from './types';
import { compose, predicate } from './utils';

const anyNumber: Decoder<number> = (blob: mixed) => {
    return typeof blob === 'number' && !Number.isNaN(blob)
        ? Ok(blob)
        : Err(annotate(blob, 'Must be number'));
};

export const number: Decoder<number> = compose(
    anyNumber,
    predicate(Number.isFinite, 'Number must be finite')
);
export const positiveNumber: Decoder<number> = compose(
    number,
    predicate((n) => n >= 0, 'Number must be positive')
);

// Integers
export const integer: Decoder<number> = compose(
    number,
    predicate(Number.isInteger, 'Number must be an integer')
);
export const positiveInteger: Decoder<number> = compose(
    number,
    predicate((n) => n >= 0 && Number.isInteger(n), 'Number must be an integer')
);
