/**
 * Returns all the keys from T where `undefined` can be assigned to.
 */
type OptionalKeys<T> = {
  [K in keyof T]-?: K extends any ? (undefined extends T[K] ? K : never) : never;
}[keyof T];

type RequiredKeys<T> = Exclude<keyof T, OptionalKeys<T>>;

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
export type AllowImplicit<T> = Resolve<
  { [K in RequiredKeys<T>]-?: T[K] } & {
    [K in OptionalKeys<T>]+?: Exclude<T[K], undefined>;
  }
>;

export type Resolve<T> = T extends (...args: unknown[]) => unknown
  ? T
  : { [K in keyof T]: T[K] };

// type X = {
//   x1: string;
//   x2?: string;
//   x3: string | undefined;
//   x4?: string | undefined;
//   x5: string | null;
//   x6?: string | null;
//   x7: string | undefined | null;
//   x8?: string | undefined | null;
//   x9: never; //       *
//   x10?: never; //     *
//   x11: undefined; //  *
//   x12?: undefined; // *
//   x13: null;
//   x14?: null;
//   x15: undefined | null;
//   x16?: undefined | null;
// };

// type RRR = RequiredKeys<X>;
// type OOO = OptionalKeys<X>;
// type AAA = AllowImplicit<X>;
