/**
 * Given a type like:
 *
 *   {
 *     a: string;
 *     b: number | undefined;
 *     c: null | undefined;
 *     d: null;
 *     e: undefined;
 *   }
 *
 * Will drop all the "undefined" types. In this case, only "e":
 *
 *   {
 *     a: string;
 *     b: number | undefined;
 *     c: null | undefined;
 *     d: null;
 *   }
 *
 */
type Compact<T> = { [K in IsDefined<T, keyof T>]: T[K] };

type IsDefined<T, K extends keyof T> = K extends any
    ? T[K] extends undefined
        ? never
        : K
    : never;

//
// HACK:
// These weird conditionals test whether TypeScript is configured with the
// `strictNullChecks` compiler option. We use these definitions to influence
// what's considered a "required" vs an "optional" key for the AllowImplicit
// type.
//
// If strictNullChecks is false, then we should not be emitting any `?` fields
// and consider all fields "required" because everything is optional by default
// in that mode anyway.
//
type NoStrictNullChecks = undefined extends string ? 1 : undefined;
//                        ^^^^^^^^^^^^^^^^^^^^^^^^
type StrictNullChecks = undefined extends string ? undefined : 1;
//                      ^^^^^^^^^^^^^^^^^^^^^^^^

export type RequiredKeys<T> = keyof Compact<{
    [K in keyof T]: undefined extends T[K] ? NoStrictNullChecks : 1;
}>;

export type OptionalKeys<T> = keyof Compact<{
    [K in keyof T]: undefined extends T[K] ? 1 : StrictNullChecks;
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
type AllowImplicit<T> = { [K in RequiredKeys<T>]-?: T[K] } & {
    [K in OptionalKeys<T>]+?: Exclude<T[K], undefined>;
};

export { AllowImplicit };
