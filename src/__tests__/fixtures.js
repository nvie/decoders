// @flow

// prettier-ignore
export const STRINGS = [
    '',
    '1',
    '3.14',
    'foo',
    ' 1 2 3 ',
    'not a number',
];

// prettier-ignore
export const NUMBERS = [
    -317.827682288236872383242082309328432093279,
    -1,
    0,
    1,
    2,
    3.14,
    Number.EPSILON,
    Math.PI,
    42,
];

// prettier-ignore
export const SPECIAL_NUMBERS = [
    NaN,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
];

// prettier-ignore
export const BOOLS = [
    false,
    true,
];

// prettier-ignore
export const CONSTANTS = [
    null,
    undefined,
];

// prettier-ignore
export const INPUTS = [
    ...STRINGS,
    ...NUMBERS,
    ...SPECIAL_NUMBERS,
    ...BOOLS,
    ...CONSTANTS,
];
