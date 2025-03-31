## [Unreleased]

- Add new `dateString` decoder (see [docs](https://decoders.cc/api.html#dateString))
- Reduce peak memory usage of `array()` decoder

## [2.6.1] - 2025-02-25

- Fix issue that could lead to corrupt annotations if somehow two verions of decoders (or
  a CJS and an ESM "copy") end up in your bundle (#1231). Thanks for reporting,
  @craig-feldman!
- Use `bundler` module resolution setting (recommended setting for libraries that use a
  bundler)
- Upgrade dev dependencies

## [2.6.0] - 2025-02-04

- Implement the [Standard Schema](https://standardschema.dev/) specification.

## [2.5.0] - 2024-09-18

**New decoders:**

- `startsWith()` ([docs](https://decoders.cc/api.html#startsWith))
- `endsWith()` ([docs](https://decoders.cc/api.html#endsWith))

- Officially drop Node 16 support (it may still work)

## [2.4.2] - 2024-06-30

- Fix a regression in `taggedUnion` (thanks for reporting, @programever)
- Upgrade all dependencies

## [2.4.0] - 2024-01-21

**New features:**

- A new `.pipe()` method on `Decoder` allows you to pass the output of one decoder into
  another:
  ```tsx
  string
    .transform((s) => s.split(',')) // transform first...
    .pipe(array(nonEmptyString)); //   ...then validate that result
  ```
  This was previously possible already with `.then`, but it wasn't as elegant to express.
- The new `.pipe()` can also dynamically select another decoder, based on the input:
  ```tsx
  string
    .transform((s) => s.split(',').map(Number)) // transform first...
    .pipe((tup) =>
      tup.length === 2
        ? point2d
        : tup.length === 3
          ? point3d
          : never('Invalid coordinate'),
    );
  ```
- Decoder error messages will now quote identifiers using single quotes, which makes them
  more human-readable in JSON responses. Compare:
  ```
  "Value at key \"foo\": Must be \"bar\", \"qux\""  // ❌ Previously
  "Value at key 'foo': Must be 'bar', 'qux'"        // ✅ Now
  ```
- Some runtime perf optimizations

**New decoders:**

- `identifier` ([docs](https://decoders.cc/api.html#identifier))
- `nanoid()` ([docs](https://decoders.cc/api.html#nanoid))

**Removed decoders:**

- Remove `numericBoolean` decoder, which was deprecated since 2.3.0.

## [2.3.0] - 2024-01-09

**New features:**

- All `enum` types are now supported ([docs](https://decoders.cc/api.html#enum_))
- Record decoder now supports both `record(values)` and `record(keys, values)` forms
  ([docs](https://decoders.cc/api.html#record))
- Add `datelike` decoder ([docs](https://decoders.cc/api.html#datelike))
- Add support for `bigint` ([docs](https://decoders.cc/api.html#bigint))
- Add built-in support for common string validations
- Better support for symbols in `constant()` and `oneOf()`

**New decoders:**

- `enum_` (see [docs](https://decoders.cc/api.html#enum_))
- `record()` (see [docs](https://decoders.cc/api.html#record))
- `select()` (see [docs](https://decoders.cc/api.html#select))
- `bigint` (see [docs](https://decoders.cc/api.html#bigint))
- `datelike` (see [docs](https://decoders.cc/api.html#datelike))
- `decimal` (see [docs](https://decoders.cc/api.html#decimal))
- `hexadecimal` (see [docs](https://decoders.cc/api.html#hexadecimal))
- `numeric` (see [docs](https://decoders.cc/api.html#numeric))

**Renamed decoders:**

Some decoders have been renamed because their names were based on Flowisms. Names have
been updated to better reflect TypeScript terminology:

- `dict()` → `record()`
- `maybe()` → `nullish()`
- `set()` → `setFromArray()` (to make room for a better `set()` decoder in a future
  version)

**Deprecated decoders:**

The following decoders are deprecated because they were not commonly used, and a bit too
specific to be in the standard library. They are also scheduled for removal in a future
decoders version.

- `dict()` (prefer `record()`)
- `hardcoded()` (prefer `always()`)
- `maybe()` (prefer `nullish()`)
- `mixed` (prefer `unknown`)
- `numericBoolean()`

**Other changes:**

- Fix: `positiveNumber` and `positiveInteger` no longer accept `-0` as valid inputs
- Fix: `either` return type would sometimes get inferred incorrectly if members partially
  overlapped (see #941)
- Reorganized internal module structure
- Simplified some of the more complicated internal types

## [2.2.0]

**Breaking change:** Dropped Flow support\*.

**Breaking change:** Projects that are not yet using `strict: true` in their
`tsconfig.json` files files are _no longer supported_. Previously, decoders went to great
lenghts to support both configurations, but the internal typing magic was getting too
complex to maintain without much benefit.

**Breaking change:** A small breaking change is introduced that removes the need for some
packaging workarounds to support projects using old TypeScript/Node versions. It’s now
simpler to use, and simpler to maintain:

```diff
-import { formatInline, formatShort } from 'decoders/format'; // ❌
+import { formatInline, formatShort } from 'decoders'; // ✅
```

```diff
-import { Result, ok, err } from 'decoders/result'; // ❌
+import { Result, ok, err } from 'decoders'; // ✅
```

Other, smaller changes, mostly internal:

- Rewritten source code in TypeScript (previously Flow)
- Rewritten test suite in Vitest (previously Jest)
- Modern ESM and CJS dual exports (fully tree-shakable when using ESM)
- Further [reduced bundle size](https://bundlephobia.com/package/decoders)
- Related, greatly simplified complex internal typing magic to make it work in projects
  with and without `strict` mode.

(\*: I'm still open to bundling Flow types within this package, but only if that can be
supported in a maintenance-free way, for example by using a script that will generate
`*.flow` files from TypeScript source files. If someone can add support for that, I'm open
to pull requests! 🙏 )

## [2.1.0]

- Officially drop Node 12 and 14 support (they may still work)
- Fix unintentional inclusion of `lib.dom.d.ts` in TypeScript

## [2.0.5]

- The returned value for `positiveInteger(-0)` is now `0`, not `-0`
- The returned value for `positiveNumber(-0)` is now `0`, not `-0`

## [2.0.4]

- Fix a bug in the `url` decoder, which could incorrectly reject URLs with a `/` in the
  query path. Thanks, @gcampax!

## [2.0.3]

- Fix bundling issue where TypeScript types would not get picked up correctly in old
  TypeScript versions. Thanks, @robinchow!

- ![](./docs/assets/tiny-ts-logo.png) Fix TypeScript types for `Result` type to allow
  implicit-undefineds.

## [2.0.2]

- ![](./docs/assets/tiny-ts-logo.png) Fix TypeScript types for `formatShort` and
  `formatInline` helper functions

## [2.0.1]

- ![](./docs/assets/tiny-ts-logo.png) **TypeScript-only:** Fix definition of JSONObject to
  reflect that its values might always be `undefined` as well.

- ![](./docs/assets/tiny-ts-logo.png) **TypeScript-only:** Changed return types of
  `{ [key: string]: T }` to `Record<string, T>`.

- ![](./docs/assets/tiny-ts-logo.png) **TypeScript-only:** Fine-tune the type of
  [`instanceOf()`](https://decoders.cc/api.html#instanceOf).

## [2.0.0]

This is a breaking change, which brings numerous benefits:

- A **simpler API** 😇
- Smaller **bundle size** (67% reduction 😱)
- **Tree-shaking** support 🍃
- Runtime **speed** 🏎️
- Better documentation 📚
- Better support for writing your own decoders 🛠️

<img alt="Bundle size comparison between v1 and v2" src="./docs/assets/size-comparison@2x.png" style="width: 100%; max-width: 829px" width="829" />

Please see the [migration guide](./MIGRATING-v2.md) for precise instructions on how to
adjust your v1 code.

The main change is the brand new `Decoder<T>` API! The **tl;dr** is:

| Replace this v1 pattern...           |     | ...with this v2 API                        | Notes                                                                        |
| :----------------------------------- | --- | :----------------------------------------- | :--------------------------------------------------------------------------- |
| `mydecoder(input)`                   | →   | `mydecoder.decode(input)`                  | [migration instructions](./MIGRATING-v2.md#stop-calling-decoders)            |
| `guard(mydecoder)(input)`            | →   | `mydecoder.verify(input)`                  | [migration instructions](./MIGRATING-v2.md#guards-are-no-longer-a-thing)     |
| `map(mydecoder, ...)`                | →   | `mydecoder.transform(...)`                 | [migration instructions](./MIGRATING-v2.md#map-is-now-transform)             |
| `compose(mydecoder, predicate(...))` | →   | `mydecoder.refine(...)`                    | [migration instructions](./MIGRATING-v2.md#compose--predicate-is-now-refine) |
| `describe(mydecoder, ...)`           | →   | `mydecoder.describe(...)`                  |                                                                              |
| `mydecoder(input).value()`           | →   | `mydecoder.value(input)`                   |                                                                              |
| `either`, `either3`, ..., `either9`  | →   | `either`                                   | [migration instructions](./MIGRATING-v2.md#eitherN-is-now-simply-either)     |
| `tuple1`, `tuple2`, ... `tuple6`     | →   | `tuple`                                    | [migration instructions](./MIGRATING-v2.md#tupleN-is-now-simply-tuple)       |
| `dispatch`                           | →   | `taggedUnion`                              | [migration instructions](./MIGRATING-v2.md#dispatch-is-now-taggedUnion)      |
| `url(...)`                           | →   | `httpsUrl` / `url` (signature has changed) | [migration instructions](./MIGRATING-v2.md#signature-of-url-has-changed)     |

The full documentation is available on [**decoders.cc**](https://decoders.cc).

Other features:

- Include ES modules in published NPM builds (yay tree-shaking! 🍃)
- Much smaller total bundle size (**67% smaller** compared to v1 😱)

Other potentially breaking changes:

- Drop support for all Node versions below 12.x
- Drop support for TypeScript versions below 4.1.0
- Drop support for Flow versions below 0.142.0
- Drop all package dependencies
- Direct reliance on `lemons` has been removed

New decoders:

- [`always`](https://decoders.cc/api.html#always)
- [`anyNumber`](https://decoders.cc/api.html#anyNumber)
- [`never`](https://decoders.cc/api.html#never)
- [`prep()`](https://decoders.cc/api.html#prep)
- [`set()`](https://decoders.cc/api.html#set)
- [`uuid`](https://decoders.cc/api.html#uuid)
- [`uuidv1`](https://decoders.cc/api.html#uuidv1)
- [`uuidv4`](https://decoders.cc/api.html#uuidv4)

Other improvements:

- [`optional()`](https://decoders.cc/api.html#optional),
  [`nullable()`](https://decoders.cc/api.html#nullable), and
  [`maybe()`](https://decoders.cc/api.html#maybe) now each take an optional 2nd param to
  specify a default value
- Better error messages for nested `either`s

Implementation changes:

- Major reorganization of internal module structure
- Various simplification of internals

## [1.25.5]

- Fix compatibility issue with TypeScript projects configured with
  `strictNullChecks: false` (or `strict: false`) (Thanks, @stevekrouse and @djlauk!)

- Officially support Node 16.x

## [1.25.4]

- Expose `nonEmptyArray` function in TypeScript (Thanks, @mszczepanczyk!)

## [1.25.3]

- Argument to `constant(...)` now has to be scalar value in both Flow and TypeScript,
  which matches its intended purpose.

## [1.25.2]

- Avoid the need for having to manually specify "as const" in TypeScript when using
  `constant()`. (Thanks, @schmod!)

## [1.25.1]

- Add support for Flow 0.154.0

## [1.25.0]

- Fix signature of `oneOf()` to reflect it can only be used with scalar/constant values

- In TypeScript, the inferred type for `oneOf(['foo', 'bar'])` will now be
  `Decoder<'foo' | 'bar'>` instead of `Decoder<string>` 🎉

- Drop support for Flow versions < 0.115.0

## [1.24.1]

- Tighten up signature types to indicate that incoming arrays won't get mutated

## [1.24.0]

- **New decoders:**

  - [`describe`](https://github.com/nvie/decoders#describe): change the error message for
    an existing decoder

- Add support for Flow 0.153.x

- Drop support for Node 13.x (unstable)

## [1.23.5]

TypeScript types:

- Add missing export for `tuple1`

## [1.23.4]

TypeScript types:

- Add missing export for `nonEmptyString`

## [1.23.3]

- Returned objects that are the result from `object()`, `inexact()`, and `exact()`
  decoders will no longer contain explicit `undefined` values for optional keys, but
  instead those keys will be missing in the returned object entirely. (#574, thanks
  @w01fgang!)

## [1.23.2]

- Add missing exports for `nonEmptyArray` and `nonEmptyString` (for TypeScript)

## [1.23.1]

- Include an error code with every FlowFixMe suppression (Flow 0.132.x compatibility)

## [1.23.0]

- **New decoders:**

  - [`json`](https://github.com/nvie/decoders#json): decodes any valid JSON value

  - [`jsonObject`](https://github.com/nvie/decoders#jsonObject): decodes any valid JSON
    object

  - [`jsonArray`](https://github.com/nvie/decoders#jsonArray): decodes any valid JSON
    array

## [1.22.2]

- **New decoders:**

  - [`inexact()`](https://github.com/nvie/decoders#inexact): like object, but retain any
    extra fields on the input value as `unknown`

  - [`iso8601`](https://github.com/nvie/decoders#iso8601): for decoding ISO8601-formatted
    date strings

- **Improved type inference** for `object()` and `exact()` decoders (see #515, thanks
  @dimfeld)

- `DecoderType` is now an alias for `$DecoderType` (to support both TypeScript and Flow
  conventional naming)

- `GuardType` (and `$GuardType`) is a new type function to extract the type of a guard
  instance

## [1.21.0]

- **New decoder** [`lazy()`](https://github.com/nvie/decoders#lazy): lazily-evaluated
  decoder, suitable to define self-referential types.

- Fix compatibility with Flow 0.127.0

## [1.20.2]

- Fix compatibility with Flow 0.126.0+

## [1.20.1]

- Upgrade debrief to correct (final) version

## [1.20.0]

- Fix issue where infinite recursion occurs when input object (the object being validated)
  contains a circular reference

## [1.19.1]

- Republish due to an NPM outage

## [1.19.0]

**New decoders:**

- To complement the tuple family of decoders, there's now also `tuple1` (thanks
  @sfarthin!)

## [1.18.1]

- Also fix Flow type bugs when Flow option `exact_by_default=true` in `debrief` dependency

## [1.18.0]

**New decoders:**

- `nonEmptyString`: like `string`, but will fail on inputs with only whitespace (or the
  empty string)

- `nonEmptyArray`: like `array`, but will fail on inputs with 0 elements

**Fixes:**

- Fix Flow type bugs when Flow option `exact_by_default=true` is enabled

## [1.17.0]

May cause breakage for Flow users:

- Fix subtle bug in `object()` and `exact()` Flow type definitions that could cause Flow
  to leak `any` under rare circumstances.

## [1.16.1]

- Internal change to make the code Flow 0.105.x compatible. Basically stops using array
  spreads (`[...things]`) in favor of `Array.from()`.

## [1.16.0]

**New feature:**

- Allow `map()` calls to throw an exception in the mapper function to reject the decoder.
  Previously, these mapper functions were not expected to ever throw.

## [1.15.0]

**New features:**

- Support constructors that have required arguments in `instanceOf` decoders in TypeScript
  (see #308, thanks @Jessidhia!)
- Add support for type predicates in `predicate()` in TypeScript (see #310, thanks
  @Jessidhia!)

**Fixes:**

- Add support for Flow >= 0.101.0

## [1.14.0]

**Potential breaking changes:**

- Stricten `pojo` criteria. Now, custom classes like `new String()` or `new Error()` will
  not be accepted as a plain old Javascript object (= pojo) anymore.

**Fixes:**

- Add support for Flow 0.98+

## [1.13.1]

**Fixes:**

- Don't reject URLs that contains commas (`,`)

## [1.13.0]

**Breaking changes:**

- Changed the API interface of `dispatch()`. The previous version was too complicated and
  was hardly used. The new version is easier to use in practice, and has better type
  inference support in TypeScript and Flow.

  **Previous usage:**

  ```
  const shape = dispatch(
      field('type', string),
      type => {
          switch (type) {
              case 'rect': return rectangle;
              case 'circle': return circle;
          }
          return fail('Must be a valid shape');
      }
  );
  ```

  **New usage:**

  ```
  const shape = dispatch('type', { rectangle, circle });
  ```

  Where `rectangle` and `circle` are decoders of which exactly one will be invoked.

* Removed the `field()` decoder. It was not generic enough to stay part of the standard
  decoder library. (It was typically used in combination with `dispatch()`, which now
  isn't needed anymore, see above.)

* `pojo` decoder now returns `Decoder<{[string]: mixed}>` instead of the unsafe
  `Decoder<Object>`.

**Fixes and cleanup:**

- Internal reorganization of modules
- Improve TypeScript support
  - Reorganization of TypeScript declarations
  - More robust test suite for TypeScript
  - 100% TypeScript test coverage

## [1.12.0]

**New decoders:**

- `oneOf(['foo', 'bar'])` will return only values matching the given values
- `instanceOf(...)` will return only values that are instances of the given class. For
  example: `instanceOf(TypeError)`.

## [1.11.1]

- Reduce bundle size for web builds
- New build system
- Cleaner package output

## [1.11.0]

**Potentially breaking changes:**

- Decoders now all take `mixed` (TypeScript: `unknown`) arguments, instead of `any` 🎉 !
  This ensures that the proper type refinements in the implementation of your decoder are
  made. (See migration notes below.)
- Invalid dates (e.g. `new Date('not a date')`) won’t be considered valid by the `date`
  decoder anymore.

**New features:**

- `guard()` now takes a config option to control how to format error messages. This is
  done via the `guard(..., { style: 'inline' })` parameter.

  - `'inline'`: echoes back the input value and inlines errors (default);
  - `'simple'`: just returns the decoder errors. Useful for use in sensitive contexts.

- Export `$DecoderType` utility type so it can be used outside of the decoders library.

**Fixes:**

- Fixes for some TypeScript type definitions.
- Add missing documentation.

**Migration notes:**

If your decoder code breaks after upgrading to 1.11.0, please take the following measures
to upgrade:

1. If you wrote any custom decoders of this form yourself:

   ```javascript
   const mydecoder = (blob: any) => ...
   //                       ^^^ Decoder function taking `any`
   ```

   You should now convert those to:

   ```javascript
   const mydecoder = (blob: mixed) => ...
   //                       ^^^^^ Decoders should take `mixed` from now on
   ```

   Or, for TypeScript:

   ```javascript
   const mydecoder = (blob: unknown) => ...
   //                       ^^^^^^^ `unknown` for TypeScript
   ```

   Then follow and fix type errors that pop up because you were making assumptions that
   are now caught by the type checker.

2. If you wrote any decoders based on `predicate()`, you may have code like this:

   ```javascript
   const mydecoder: Decoder<string> = predicate(
       (s) => s.startsWith('x'),
       'Must start with "x"'
   );
   ```

   You'll have to change the explicit Decoder type of those to take two type arguments:

   ```javascript
   const mydecoder: Decoder<string, string> = predicate(
       //                               ^^^^^^ Provide the input type to predicate() decoders
       (s) => s.startsWith('x'),
       'Must start with "x"'
   );
   ```

   This now explicitly records that `predicate()` makes assumptions about its input
   type—previously this wasn’t get caught correctly.

## [1.10.6]

- Make Flow 0.85 compatible

## [1.10.5]

- Update to latest debrief (which fixes a TypeScript bug)

## [1.10.4]

- Drop dependency on babel-runtime to reduce bundle size

## [1.10.3]

- Fix minor declaration issue in TypeScript definitions

## [1.10.2]

- Tuple decoder error messages now show decoder errors in all positions, not just the
  first occurrence.

**New decoders:**

- New tuple decoders: `tuple3`, `tuple4`, `tuple5`, and `tuple6`
- `unknown` decoder is an alias of `mixed`, which may be more recognizable for TypeScript
  users.

## [1.10.1]

- TypeScript support

## [1.10.0]

**Breaking:**

- Private helper function `undefined_or_null` was accidentally exported in the package.
  This is a private API.

## [1.9.0]

**New decoder:**

- `dict()` is like `mapping()`, but will return an object rather than a Map instance,
  which may be more convenient to handle in most cases.

**Breaking:**

- `optional(..., /* allowNull */ true)` has been removed (was deprecated since 1.8.3)

## [1.8.3]

**New decoder:**

- `maybe()` is like `optional(nullable(...))`, i.e. returns a "maybe type".

**Deprecation warning:**

- `optional(..., /* allowNull */ true)` is now deprecated in favor of `maybe(...)`

## [1.8.2]

**Improved error reporting:**

- Fix bug where empty error branches could be shown in complex either expressions (fixes
  #83)

## [1.8.1]

- Fix: revert accidentally emitting \$ReadOnlyArray types in array decoders

## [1.8.0]

- Drop support for Node 7
- Declare inputted arrays will not be modified (treated as read-only)

## [1.7.0]

- Make decoders fully [Flow Strict](https://flow.org/en/docs/strict/) compatible

## [1.6.1]

- Upgraded debrief dependency
- Behave better in projects that have Flow's `experimental.const_params` setting turned on

## [1.6.0]

- **New decoders!**
  - `exact()` is like `object()`, but will fail if the inputted object contains
    superfluous keys (keys that aren't in the object definition).

## [1.5.0]

- Collect and report all nested errors in an object() at once (rather than error on the
  first error).

**Breaking:**

- Remove deprecated `message` argument to `object()`

## [1.4.6]

- Add missing documentation

## [1.4.5]

- Upgrade second-level dependencies

## [1.4.4]

- Declare library to be side effect free (to help optimize webpack v4 builds)
- Upgrade dependencies

## [1.4.1]

- Improve internals of the error message serializer (debrief)

## [1.4.0]

- **New decoders!**
  - `email` validator based on the [almost perfect email regex](http://emailregex.com/)
  - `url` validator for validating HTTPS URLs (most common use case)
  - `anyUrl` validator for validating any URL scheme

## [1.3.1]

- Fix bug where dates, or arrays (or any other Object subclass) could pass for a record
  with merely optional fields.

## [1.3.0]

- Much improved error messages! They were redesigned to look great in terminals and to
  summarize only the relevant bits of the error message, striking a balance between all
  the details and the high level summary.

## [1.2.4]

- **New features**:
  - `truthy` takes any input and returns whether the value is truthy
  - `numericBoolean` takes only numbers as input, and returns their boolean interpretation
    (0 = false, non-0 = true)

## [1.2.3]

Same as 1.2.2.

## [1.2.2]

- **New feature** `mixed` decoder, for unverified pass-thru of any values

## [1.2.1]

- **Fix** Expose the following decoders publicly:
  - `integer`
  - `positiveInteger`
  - `positiveNumber`

## [1.2.0]

- **New feature** `regex()`, for building custom string decoders
- Tiny tweaks to improve error messages (more structural improvements are on the roadmap)

## [1.1.0]

- Expose pojo() decoder, for plain old objects (with mixed contents)
- Expose poja() decoder, for plain old arrays (with mixed contents)
- Perf: make `tuple2()` decoder lazier

## [1.0.1]

- Expose new "either" decoders at the too level

## [1.0.0]

- **BREAKING** Removes the old public ("compat") API
- Finalize/settle on public API

## [0.1.3]

- Add whole series for either, either3, either4, ..., either9
- Updated dev dependencies

## [0.1.2]

- Add `date` decoder, which decodes `Date` instances
- Improve error output detail when throwing errors

## [0.1.1]

- Export `g2d()` helper function that can help adoption to new-style APIs by converting
  old-style decoders (now called guards) to new-style decoders.

## [0.1.0]

- **Breaking change** New API: simplified names, split up decoders from guards. What used
  to be called "decoders" in 0.0.x ("things that either return a value or throw a runtime
  error") are now called "guards" in 0.1.0. The meaning of the term "decoders" is now
  changed to a thing that either is an "Ok" value or an "Err" value.

  To convert to the new API, do this:

  ```javascript
  // Old way
  import { decodeNumber, decodeObject, decodeString } from 'decoders';

  const decoder = decodeObject({
    name: decodeString(),
    age: decodeNumber(),
  });

  // -------------------------------------------------------------------

  // New way
  import { guard, number, object, string } from 'decoders';

  const guard = guard(
    object({
      name: string,
      age: number,
    }),
  );
  ```
