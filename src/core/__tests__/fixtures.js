// @flow strict

// prettier-ignore
export const STRINGS: Array<string> = [
    '',
    '1',
    '3.14',
    'foo',
    ' 1 2 3 ',
    'not a number',
];

// prettier-ignore
export const NUMBERS: Array<number> = [
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
export const SPECIAL_NUMBERS: Array<number> = [
    NaN,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
];

// prettier-ignore
export const DATES: Array<Date> = [
    new Date('1996-3-17'),
    new Date(1534521367000),
    new Date('2017-11-28T15:56:07+0200'),
    new Date(),
];

// prettier-ignore
export const SPECIAL_DATES: Array<Date> = [
    new Date('not a date'),
];

// prettier-ignore
export const BOOLS: Array<boolean> = [
    false,
    true,
];

// prettier-ignore
export const CONSTANTS: Array<null | void> = [
    null,
    undefined,
];

// prettier-ignore
export const INPUTS: Array<mixed> = [
    ...STRINGS,
    ...NUMBERS,
    ...SPECIAL_NUMBERS,
    ...DATES,
    ...SPECIAL_DATES,
    ...BOOLS,
    ...CONSTANTS,
];
