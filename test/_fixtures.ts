// prettier-ignore
export const STRINGS: string[] = [
    '',
    '1',
    '3.14',
    'foo',
    ' 1 2 3 ',
    'not a number',
    '42',
];

// prettier-ignore
export const NUMBERS: number[] = [
    -317.827682288236872,
    -1,
    -0,
    0,
    1,
    2,
    3.14,
    Number.EPSILON,
    Math.PI,
    42,
];

// prettier-ignore
export const SPECIAL_NUMBERS: number[] = [
    NaN,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
];

// prettier-ignore
export const DATES: Date[] = [
    new Date('1996-3-17'),
    new Date(1534521367000),
    new Date('2017-11-28T15:56:07+0200'),
    new Date(),
];

// prettier-ignore
export const SPECIAL_DATES: Date[] = [
    new Date('not a date'),
];

// prettier-ignore
export const BOOLS: boolean[] = [
    false,
    true,
];

// prettier-ignore
export const CONSTANTS: (null | undefined)[] = [
    null,
    undefined,
];

// prettier-ignore
export const INPUTS: unknown[] = [
    ...STRINGS,
    ...NUMBERS,
    ...SPECIAL_NUMBERS,
    ...DATES,
    ...SPECIAL_DATES,
    ...BOOLS,
    ...CONSTANTS,
];
