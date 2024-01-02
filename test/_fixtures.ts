export const STRINGS: string[] = [
  '',
  '1',
  '3.14',
  'foo',
  ' 1 2 3 ',
  'not a number',
  '42',

  // Emojis
  '🔥',
  '🦊',
  '😶‍🌫', // emoji combo
];

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

export const BIGINTS: bigint[] = [
  0n,
  1n,
  42n,
  100n,
  -4543000000n,
  BigInt(
    '12345678901234567890123456789012345678901234567890123456789012345678901234567890',
  ),
];

export const SPECIAL_NUMBERS: number[] = [
  NaN,
  Number.NEGATIVE_INFINITY,
  Number.POSITIVE_INFINITY,
];

export const DATES: Date[] = [
  new Date('1996-3-17'),
  new Date(1534521367000),
  new Date('2017-11-28T15:56:07+0200'),
  new Date(),
];

export const SPECIAL_DATES = [
  new Date('not a date'),
  new Date(Number.POSITIVE_INFINITY),
  new Date(Number.NEGATIVE_INFINITY),
];

export const BOOLS = [false, true];

export const CONSTANTS = [null, undefined];

export const SYMBOLS = [Symbol.for('x'), Symbol('x'), Symbol('x')];

export const INPUTS: unknown[] = [
  ...STRINGS,
  ...NUMBERS,
  ...BIGINTS,
  ...SPECIAL_NUMBERS,
  ...DATES,
  ...SPECIAL_DATES,
  ...BOOLS,
  ...CONSTANTS,
  ...SYMBOLS,
];
