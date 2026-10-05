# Migrating to v3

<!-- XXX Temporary: implementation status on the release-3.0 branch. Remove before release. -->

**Implemented on this branch?**

- [x] Aliases removed (+ historic doc redirects)
- [x] `setFromArray`, `mapping` removed (+ historic doc redirects)
- [ ] Readonly composites return the input
- [ ] Explicit-`undefined` keys retained
- [ ] Methods need `this`
- [ ] `lazy()` memoizes
- [x] `.chain(decoder)` throws
- [x] `.pipe(fn)` throws
- [x] `integer` & co. reject unsafe integers
- [ ] `'union'` annotation
- [ ] `Too deeply nested` rejection
- [ ] `taggedUnion()` object form removed
- [x] 2.x/3.x brand split
- [ ] Deprecations flagged (`min`/`max`/`between`, `string()`)
- [ ] Constraint syntax (`string({...})`, `startsWith(p, {...})`, …)

Decoders v3 is faster, can validate without copying, and can generate JSON Schema from any
decoder. For most projects, upgrading is a version bump plus a few search & replaces.

If you run into anything this guide doesn't cover, please
[open an issue](https://github.com/nvie/decoders/issues/new) and I'm happy to help 🙏 !

## 🏁 Checklist

1. Install `$ npm install decoders@3`
1. Replace removed aliases, see [instructions](#removed-aliases).
1. **If you use `setFromArray` or `mapping`:** see
   [instructions](#setfromarray-and-mapping-are-removed).
1. **If you mutate decoded values _and_ keep using the original input:** see
   [instructions](#decoded-values-may-be-the-input-itself).
1. **If you destructure decoder methods:** see [instructions](#dont-destructure-methods).
1. Replace `.chain(decoder)` by `.pipe(decoder)`, and `.pipe(fn)` by `.chain(fn)`, see
   [instructions](#pipe-takes-decoders-chain-takes-functions).
1. Check your `lazy()` factories, see [instructions](#lazy-calls-its-factory-only-once).
1. **If you decode integers beyond ±2^53−1:** see
   [instructions](#integer-and-natural-reject-unsafe-integers).
1. **If you inspect annotations:** see
   [instructions](#annotations-have-a-new-union-member).
1. Rewrite `taggedUnion()` calls, see
   [instructions](#taggedunion-takes-branches-not-an-object).
1. **If you have snapshot tests on error messages:** see
   [instructions](#error-messages-changed).
1. Optionally, adopt the new constraint syntax, see
   [instructions](#optional-adopt-the-new-constraint-syntax).

## Removed aliases

These were deprecated in 2.x and are now removed. A simple search & replace will do:

| Replace this v2 alias... |     | ...with this v3 API                                  |
| :----------------------- | --- | :--------------------------------------------------- |
| `dateString`             | →   | [`isoDateString`](https://decoders.cc/isoDateString) |
| `iso8601`                | →   | [`isoDate`](https://decoders.cc/isoDate)             |
| `datelike`               | →   | [`flexDate`](https://decoders.cc/flexDate)           |

## `setFromArray` and `mapping` are removed

Both turned their input into a different shape (an array into a `Set`, an object into a
`Map`), which nothing in their names said. Transform the output yourself instead:

```ts
setFromArray(d); // ❌ v2
array(d).transform((xs) => new Set(xs)); // ✅ v3

mapping(d); // ❌ v2
record(d).transform((obj) => new Map(Object.entries(obj))); // ✅ v3
```

## Decoded values may be the input itself

<!-- prettier-ignore -->
> [!NOTE]
> This change will most likely not affect you, other than making your decoders faster.
> It's listed here for completeness.

In 2.x, `exact`, `inexact`, `array`, `tuple`, `record` and `json` always built a fresh
copy of their input. In 3.x, when all of their children only _validate_ (no
`.transform()`, no defaults), they skip the copy and return the input by reference. This
makes decoding them significantly faster (~2–3× for composite decoders):

```ts
const input = JSON.parse(body);
const user = exact({ name: string, tags: array(string) }).verify(input);

// 2.x: user !== input
// 3.x: user === input
```

The input is typically a fresh `JSON.parse()` result that nothing else holds on to. It
only matters if you mutate the decoded value _and_ still use the original input elsewhere
(or the other way around), because they're now the same object.

You can check this with `decoder.isReadonly`:

- `true`: always returns the input itself. The decoded value `===` the input.
- `false`: may return a copy, a transformed value, or the input itself. Depends on the
  implementation.

Related: keys that are explicitly `undefined` in the input are now retained in the output
of `exact` and `inexact` (`{ a: undefined }` stays `{ a: undefined }`).

## Don't destructure methods

Destructuring methods off a decoder was never a recommended practice, but in 2.x it
happened to work. If you did this anyway, note that decoder methods now rely on `this`:

```ts
// ❌ No longer works
const { verify } = string;
verify('hi');

// ✅ Call as a method
string.verify('hi');
```

## `lazy()` calls its factory only once

`lazy(() => ...)` now calls its factory the first time it's needed and reuses the result.
If your factory had side effects, or returned a different decoder on each call, it won't
anymore.

## `.pipe()` takes decoders, `.chain()` takes functions

`.pipe()` now only accepts decoders, and `.chain()` only accepts functions. Passing the
other kind throws when the decoder is constructed.

Passing a decoder to `.chain()` was deprecated in 2.x:

```ts
// ❌ 2.x
string.chain(numeric);

// ✅ 3.x
string.pipe(numeric);
```

Passing a function to `.pipe()` to pick the next decoder based on the value is now done
with `.chain()`. The function is the same:

```ts
// ❌ 2.x
coords.pipe((t) => (t.length === 2 ? point2d : point3d));

// ✅ 3.x
coords.chain((t) => (t.length === 2 ? point2d : point3d));
```

## `integer` and `natural` reject unsafe integers

`integer`, `natural` and `positiveInteger` now only accept _safe_ integers
(`Number.isSafeInteger`), i.e. between −(2^53−1) and 2^53−1. Beyond that, a number can't
be told apart from its neighbours (`2 ** 53 === 2 ** 53 + 1`), so it's rarely what you
meant. They're rejected with `Number must be a safe integer`.

If you do want to accept those, this is the exact 2.x definition of `integer`:

```ts
// ✅ 3.x, accepts unsafe integers too
number.refine(Number.isInteger, 'Number must be an integer');
```

## Annotations have a new union member

This section only applies **if you inspect error annotations** (e.g. in a custom
formatter).

The `Annotation` union gains a member for union failures, produced by `either()`. An
exhaustive `switch` over `annotation.type` needs a new case:

```ts
switch (annotation.type) {
  case 'union': ... // ✅ new in 3.x
  case 'object': ...
  case 'array': ...
  case 'scalar': ...
  case 'opaque': ...
}
```

<!-- XXX The union annotation's shape is still an open question in ROADMAP.md -->

## Error messages changed

This section only applies **if you snapshot-test error messages**.

- Deeply nested input (e.g. through `lazy()` or `json`) now rejects with
  `Too deeply nested` instead of throwing a `RangeError`.
- `natural` and `nonNegativeNumber` report `Number must be positive` for any negative
  number. In 2.x, `-Infinity` gave `Number must be finite`, and `natural(-3.5)` gave
  `Number must be an integer`.

Decoding _results_ don't change, only the error text.

## `taggedUnion()` takes branches, not an object

`taggedUnion()` no longer takes an object mapping tags to decoders. That form made you
spell every tag twice, and nothing checked that the two agreed:

<!-- prettier-ignore -->
```ts
const shape = taggedUnion('type', {
  circle: object({ type: constant('circle'), radius: number }),
//^^^^^^                           ^^^^^^
  rect: object({ type: constant('rect'), width: number, height: number }),
//^^^^                           ^^^^
});
```

Pass the branches as arguments instead. Each branch already says which tag it accepts:

```ts
// ❌ 2.x
const shape = taggedUnion('type', {
  circle: object({ type: constant('circle'), radius: number }),
  rect: object({ type: constant('rect'), width: number, height: number }),
});

// ✅ 3.x
const shape = taggedUnion(
  'type',
  object({ type: constant('circle'), radius: number }),
  object({ type: constant('rect'), width: number, height: number }),
);
```

Every branch must pin its tag with a `constant()` (or `oneOf()`, etc.), and no two
branches may accept the same tag. Otherwise `taggedUnion()` throws when it's constructed,
not when decoding. In return, it always picks exactly one branch.

## Decoders from 2.x and 3.x don't mix

If your project ends up with both 2.x and 3.x installed (e.g. through a dependency),
decoders from one cannot always be composed with the other anymore. Make sure you only
[have one copy](https://decoders.cc/docs/using-in-monorepos) of decoders installed.

## Optional: adopt the new constraint syntax

Nothing here is required, but the old forms are deprecated and your editor will strike
them through:

| Replace this v2 pattern...             |     | ...with this v3 API                      |
| :------------------------------------- | --- | :--------------------------------------- |
| `sized(string, { max: 10 })`           | →   | `string({ max: 10 })`                    |
| `sized(array(d), { min: 1 })`          | →   | `array(d, { min: 1 })`                   |
| `sized(startsWith('x_'), { size: 8 })` | →   | `startsWith('x_', { size: 8 })`          |
| `sized(hexadecimal, { size: 64 })`     | →   | `hexadecimal({ size: 64 })`              |
| `sized(regex(re, 'msg'), { max: 20 })` | →   | `regex(re, { max: 20, message: 'msg' })` |
| `min(0)`                               | →   | `number({ min: 0 })`                     |
| `max(10, integer)`                     | →   | `integer({ max: 10 })`                   |
| `between(1, 10)`                       | →   | `number({ min: 1, max: 10 })`            |
| `min(1, natural)`                      | →   | `natural({ min: 1 })`                    |
| `number.refine((n) => n > 0, '…')`     | →   | `number({ gt: 0 })`                      |
| `positiveNumber`                       | →   | `nonNegativeNumber`                      |
| `positiveInteger`                      | →   | `natural`                                |

`string()`, `number()` etc. also work, but are flagged as deprecated. Prefer `string` over
`string()`.
