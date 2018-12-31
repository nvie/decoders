// @flow strict

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
export const DATES = [
    new Date('1996-3-17'),
    new Date(1534521367000),
    new Date('2017-11-28T15:56:07+0200'),
    new Date(),
];

// prettier-ignore
export const SPECIAL_DATES = [
    new Date('not a date'),
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
    ...DATES,
    ...SPECIAL_DATES,
    ...BOOLS,
    ...CONSTANTS,
];
