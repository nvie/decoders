/**
 * Forces TypeScript to "evaluate" named helper types, making API signatures
 * clearer in IDEs.
 *
 * @see https://effectivetypescript.com/2022/02/25/gentips-4-display/
 */
type Resolve<T> = T extends (...args: unknown[]) => unknown
  ? T
  : { [K in keyof T]: T[K] };

/**
 * Relaxes a discriminated union type definition, by explicitly adding
 * properties defined in any other member as optional `never`.
 *
 * This makes accessing the members much more relaxed in TypeScript.
 */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-indexed-object-style */
export type Relax<T> = DistributiveRelax<T, T extends any ? keyof T : never>;

type DistributiveRelax<T, Ks extends string | number | symbol> = T extends any
  ? Resolve<{ [K in keyof T]: T[K] } & { [K in Exclude<Ks, keyof T>]?: never }>
  : never;
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-indexed-object-style */
