/**
 * Given a type like:
 *
 *   {
 *     a: string;
 *     b: number | undefined;
 *     c: null | undefined;
 *     d: null;
 *     e: undefined;
 *     f?: undefined;
 *     g: never;
 *     h?: never;
 *   }
 *
 * Will drop all the "undefined" types. In this case, only "e", "f", "g", and "h":
 *
 *   {
 *     a: string;
 *     b: number | undefined;
 *     c: null | undefined;
 *     d: null;
 *   }
 *
 */
type Compact<T> = Pick<T, IsDefined<T, keyof T>>;

/**
 * Returns keys that are not just undefined. If undefined appears in a unnion.
 */
type IsDefined<T, K extends keyof T> = K extends any
  ? T[K] extends undefined
    ? never
    : K
  : never;

type X = {
  x1: string;
  x2?: string;
  x3: string | undefined;
  x4?: string | undefined;
  x5: string | null;
  x6?: string | null;
  x7: string | undefined | null;
  x8?: string | undefined | null;
  x9: never;
  x10?: never;
  x11: undefined;
  x12?: undefined;
  x13: null;
  x14?: null;
  x15: undefined | null;
  x16?: undefined | null;
};
type X1 = IsDefined<X, 'x1'>;
type X2 = IsDefined<X, 'x2'>;
type X3 = IsDefined<X, 'x3'>;
type X4 = IsDefined<X, 'x4'>;
type X5 = IsDefined<X, 'x5'>;
type X6 = IsDefined<X, 'x6'>;
type X7 = IsDefined<X, 'x7'>;
type X8 = IsDefined<X, 'x8'>;
type X9 = IsDefined<X, 'x9'>;
type X10 = IsDefined<X, 'x10'>;
type X11 = IsDefined<X, 'x11'>;
type X12 = IsDefined<X, 'x12'>;
type X13 = IsDefined<X, 'x13'>;
type X14 = IsDefined<X, 'x14'>;
type X15 = IsDefined<X, 'x15'>;
type X16 = IsDefined<X, 'x16'>;
type DEFINEDS = IsDefined<X, keyof X>;
type NOT_DEFINEDS = Exclude<keyof X, IsDefined<X, keyof X>>;
//   ^?

type YY = Compact<X>;
type RRR = RequiredKeys<X>;
type OOO = OptionalKeys<X>;

type RequiredKeys<T> = keyof Compact<{
  [K in keyof T]: undefined extends T[K] ? never : 1;
}>;

type OptionalKeys<T> = keyof Compact<{
  [K in keyof T]: undefined extends T[K] ? 1 : 0;
}>;

/**
 * Transforms an object type, by marking all fields that contain "undefined"
 * with a question mark, i.e. allowing implicit-undefineds when
 * explicit-undefined are also allowed.
 *
 * For example, if:
 *
 *   type User = {
 *     name: string;
 *     age: number | null | undefined;
 *   }
 *
 * Then AllowImplicit<User> will become equivalent to:
 *
 *   {
 *     name: string;
 *     age?: number | null;
 *        ^
 *        Note the question mark
 *   }
 */
type AllowImplicit<T> = Resolve<
  { [K in RequiredKeys<T>]-?: T[K] } & {
    [K in OptionalKeys<T>]+?: Exclude<T[K], undefined>;
  }
>;

export type Resolve<T> = T extends (...args: unknown[]) => unknown
  ? T
  : { [K in keyof T]: T[K] };

export type { AllowImplicit };
