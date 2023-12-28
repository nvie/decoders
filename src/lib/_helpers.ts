/* eslint-disable @typescript-eslint/no-explicit-any */

type RequiredKeys<T extends object> = {
  [K in keyof T]: undefined extends T[K] ? never : K;
}[keyof T];

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
 * Then UndefinedToOptional<User> will become equivalent to:
 *
 *   {
 *     name: string;
 *     age?: number | null | undefined;
 *        ^
 *        Note the question mark
 *   }
 */
export type UndefinedToOptional<T extends object> = Resolve<
  Pick<Required<T>, RequiredKeys<T>> & Partial<T>
>;

export type Resolve<T> = T extends Function ? T : { [K in keyof T]: T[K] };
