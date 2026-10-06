# Decoders 3.x roadmap

Draft. Everything under "Open questions" is undecided; everything else is the proposal.
Rationale for settled decisions lives in [ROADMAP-DECISIONS.md](./ROADMAP-DECISIONS.md).

## At a glance: the 3.0 changelog

<!-- XXX Temporary: implementation status on this branch. Remove before release. -->

**Implemented on this branch?** In order of execution:

_Quick wins (independent, settled):_

- [x] Remove `dateString`, `iso8601`, `datelike` (+ keep their docs URLs redirecting)
- [x] `.chain(decoder)` throws
- [x] `.pipe(fn)` throws; `.chain(fn)` infers `A | B` when picking between decoders
- [x] `integer`, `natural` & co. reject unsafe integers (`Number.isSafeInteger`)
- [x] `record(v, { min, max })`, `record(k, v, { min, max })`
- [x] Remove `setFromArray`, `mapping` (+ keep their docs URLs redirecting)

_Main track (each step builds on the previous):_

- [x] `string`/`number`/`integer({...})`, `string()` & co. deprecated (Feature 1)
- [x] `regex(re, { max, message? })`, `regex(re, msg)` kept as shorthand
- [x] Size options on `nonEmptyString`, `decimal`, `hexadecimal`, `identifier`
- [x] `startsWith`/`endsWith` size options
- [x] `trimmed`
- [x] `numeric({ min, max, gt, lt })`, bounding the decoded number
- [x] Deprecate `min`, `max`, `between`
- [x] Readonly: `isReadonly`, `ReadonlyDecoder<T>`, `defineReadonly()` (Feature 2)
- [ ] `jsonYolo`
- [ ] `toJSONSchema()`, `~standard.jsonSchema` (Feature 3)
- [ ] `taggedUnion(key, ...branches)`, object form removed (Feature 5)

_Independent, open questions to settle first:_

- [ ] Deep input never throws (Feature 4)
- [ ] Typed `prep()` input (Feature 6)
- [ ] Better branching than `select()` (see Open questions)
- [ ] `masked(d)` (Feature 7)

_Last:_

- [ ] Decide `uniqueArray` dedupe vs reject (see Open questions), then implement it. The
      tradeoff hinges on readonly and schema, so settle it once those have landed.
- [ ] Final perf evaluation vs latest 2.x (see Rollout), update CHANGELOG numbers

**New APIs:**

- Constraints next to the type (Feature 1). `string` itself is unchanged.
  ```ts
  string({ min: 2, max: 10 });
  number({ min: 0 });
  number({ gt: 0, lt: 1 }); // exclusive bounds
  integer({ max: 100 });
  natural({ max: 10 });
  hexadecimal({ size: 64 });
  startsWith('henk_', { size: 24 }); // Decoder<`henk_${string}`>
  trimmed({ min: 1 }); // new: '  hi  ' → 'hi'
  ```
- Readonly decoders validate without copying (Feature 2). `exact`, `inexact`, `array`,
  `tuple`, `record` and `json` hand back their input when all their children are readonly.
  ```ts
  json.verify(input) === input; // true
  exact({ name: string }).isReadonly; // true
  exact({ name: string.transform(upper) }).isReadonly; // false
  object({ name: string }).isReadonly; // false: strips unknown keys
  ```
- JSON Schema from any decoder (Feature 3): `toJSONSchema(decoder)`, and
  `decoder['~standard'].jsonSchema`.
- `.decode()` never throws on deeply nested input; deep rejections stay fast (Feature 4).
- `taggedUnion('type', circle, rect)`: each branch pins its own tag, checked at
  construction, so it always picks exactly one branch (Feature 5). `either()` is
  unchanged: it tries its branches in order.
- `prep()` behind `.pipe()` gets a typed input (Feature 6).
- `masked(d)`: a value at that position never appears in an error (Feature 7).
  ```ts
  object({ username: string, password: masked(string) });
  ```
- `record(string, { max: 10 })`: bounds on the number of keys, like `array(d, { max })`.
- `uniqueArray(string, { max: 10 })`: an array, deduplicated, bounds on the result.
- New: `jsonYolo`, `defineReadonly()`, `ReadonlyDecoder<T>`, `masked()`.

**Breaking!** See [MIGRATING-v3.md](./MIGRATING-v3.md).

**Deprecated:** `min`, `max`, `between`, and calling callable atomics without options
(`string()`, `number()`, …; use `string`, `number`, …).

**Changed:** `integer`, `natural`, `positiveInteger` reject unsafe integers (beyond
±2^53−1). `natural` and `nonNegativeNumber` report `Number must be positive` for any
negative number.

**Removed:** `dateString`, `iso8601`, `datelike`, `setFromArray`, `mapping`, the mapping
form `taggedUnion(key, { A, B })` (use `taggedUnion(key, A, B)`), and passing a function
to `.pipe()` (use `.chain()`).

## One mechanism

Features 1–3 share one core change. A decoder is `decode` plus two static facts computed
once at construction: whether it is readonly, and what JSON it accepts.

```ts
class DecoderImpl<T> {
  readonly decode: (blob: unknown) => DecodeResult<T>;
  readonly isReadonly: boolean; // narrowed to `true` by ReadonlyDecoder<T>
  readonly schema: SchemaDef; // JSON Schema of what it accepts (Feature 3)
}
```

A callable atomic is a decoder with a call signature bolted on, and a constraint like
`{ max: 100 }` is one options object that produces both a reject function and schema
keywords. Readonly means the decoder hands its input back, which is also what makes those
keywords true of the input and not just of the output. Both fields are assigned in the
constructor, and the `decode` hot path never reads either, so atomics stay exactly as fast
as they are.

Masking (Feature 7) adds a third, internal one: how to echo an input value in an error. It
is only read on the error path.

# Feature 1: Callable atomics

The constraint belongs next to the type, not wrapped around it:

```ts
string({ min: 2, max: 10 }); // instead of sized(string, { min: 2, max: 10 })
number({ min: 0 }); // instead of min(0)
number({ gt: 0 }); // instead of number.refine((n) => n > 0, ...)
hexadecimal({ size: 64 });
array(string, { max: 10 }); // free functions keep taking options positionally
startsWith('henk_', { size: 24 }); // instead of sized(startsWith('henk_'), { size: 24 })
```

This is the feature users ask for, it is the one that changes everyday code, and it needs
nothing from the other two.

`array(d, { min, max })` already exists, and becomes the preferred way to constrain an
array's length: docs and examples use it over `sized(array(d), ...)`, since it checks the
length before decoding any item. `nonEmptyArray(d)` stays, because its `[T, ...T[]]`
return type is worth having.

`record` gains the same trailing options, bounding the number of keys: `record(v, o)` and
`record(k, v, o)`, told apart by whether the second argument is a decoder. Like `array`,
it counts keys before decoding any value, and errors read `Must have at most 10 keys`. Its
schema gets `minProperties`/`maxProperties`. Liveblocks has this as a local `maxKeys()`
helper (9 call sites), with a TODO to move it into the library.

## Safe integers

`integer`, `natural` and the deprecated `positiveInteger` check `Number.isSafeInteger`
instead of `Number.isInteger`. Almost nobody wants `2 ** 53 + 1`, a value that can't be
told apart from its neighbours; `number.refine(Number.isInteger, ...)` (the 2.x
definition) stays available for those who do. This is a quick win that goes first: it
changes behavior, needs nothing else, and removes
`natural.refine(Number.isSafeInteger, ...)` workarounds (Liveblocks has two, with TODOs
asking for exactly this). With Feature 3, the schema gains `minimum`/`maximum` at ±2^53−1
through `constrain`, for free.

`integer`, `natural` and `nonNegativeNumber` are each a single `anyNumber.reject()`
instead of a `.refine()` chain. A valid number passes one short-circuiting check
(`Number.isSafeInteger(n) && isSignPositive(n)` for `natural`); only a rejected one works
out _why_, in a fixed order, so every error names the actual problem:

| input     | `integer`                     | `natural`                     |
| --------- | ----------------------------- | ----------------------------- |
| `-2e43`   | Number must be a safe integer | Number must be positive       |
| `2 ** 53` | Number must be a safe integer | Number must be a safe integer |
| `3.5`     | Number must be an integer     | Number must be an integer     |
| `NaN`     | Number must be finite         | Number must be finite         |

`natural` and `nonNegativeNumber` check the sign first (so `-Infinity` and `-3.5` are
"positive" errors), then finiteness, integrality, and safety. `isSignPositive` and
`isSignNegative` (`src/lib/utils.ts`) test the IEEE sign, so +0/-0 fall on their own side
and NaN on neither. Measured against 2.12.1, all three decode 4–6x faster on valid input
in isolation, and 2–3x faster when many decoders share the same call sites (likely because
V8 inlines the shared `.decode()`/`.reject()` path only while it sees a single decoder).

## `callable()`

A callable atomic is the decoder object with a call signature. At runtime it is an arrow
function whose prototype is swapped to the decoder prototype and which carries the same
own fields in the same order (verified: all callables share one hidden class, method-call
speed identical to a plain instance):

```ts
function callable<T, O>(
  base: Decoder<T>,
  configure: (self: Decoder<T>, options: O) => Decoder<T>,
) {
  const self = (options?: O) => (options === undefined ? self : configure(self, options)); // string() -> string
  Object.setPrototypeOf(self, DecoderImpl.prototype);
  return init(self, base); // copies base's own fields, in order
}

export const string: ReadonlyCallableDecoder<string, SizeOptions> = callable(
  defineReadonly(isString, 'Must be string'),
  sized,
);
export const number: ReadonlyCallableDecoder<number, RangeOptions> = callable(
  anyNumber.refine(Number.isFinite, 'Number must be finite'),
  ranged,
);
export const integer: ReadonlyCallableDecoder<number, RangeOptions> = callable(
  anyNumber.reject(/* see Safe integers */),
  ranged,
);
export const natural: ReadonlyCallableDecoder<number, RangeOptions> = callable(
  anyNumber.reject(/* … */),
  ranged,
);
export const nonNegativeNumber: ReadonlyCallableDecoder<number, RangeOptions> = callable(
  anyNumber.reject(/* … */),
  ranged,
);
```

Every number decoder takes `RangeOptions`, except `anyNumber`: it accepts `NaN`, which
compares false against any bound and would slip through all of them. The deprecated
`positiveNumber`/`positiveInteger` are the same objects, so they are callable too.

`init` copies whatever own fields a decoder has, so this signature does not change when
`isReadonly` and `schema` arrive.

The types only add a call signature and never re-declare a method, so a callable atomic
flows through `either()`, `object()`, `.pipe()` and `Record<string, Decoder<unknown>>`
like any other decoder:

```ts
interface ReadonlyCallableDecoder<T, O> extends ReadonlyDecoder<T> {
  /** @deprecated Prefer not calling, e.g. `string` instead of `string()` */
  (): ReadonlyDecoder<T>;
  (options: O): ReadonlyDecoder<T>;
}
interface CallableDecoder<T, O> extends Decoder<T> {
  /** @deprecated Prefer not calling, e.g. `string` instead of `string()` */
  (): Decoder<T>;
  (options: O): Decoder<T>;
}

string({ min: 2, max: 10 }); // ReadonlyDecoder<string>
either(string({ max: 3 }), number({ min: 0 })); // ReadonlyDecoder<string | number>
trimmed({ max: 5 }); // Decoder<string>: trims, so not readonly
string(); // works, returns `string` itself, but flagged as deprecated
```

`string` stays the canonical spelling. `string()` compiles, since people coming from other
libraries will type it by habit and a hard "Expected 1 arguments" error would read as the
library being broken, but the deprecated overload strikes it through in editors and points
back at `string`. Every callable atomic gets the same overload, with its own name in the
message. The options overload must come last if anything still infers from the call
signature, since TS infers from the last overload. That was `.pipe(fn)`, which is gone
(below), so this may no longer matter (verify in `test-d`).

With readonly (Feature 2), a readonly base gives a `ReadonlyCallableDecoder`, whose call
signature returns a `ReadonlyDecoder` too. `trimmed` and `numeric` transform their input,
so they're plain `CallableDecoder`s.

`.pipe()` takes decoders only, and `.chain()` takes functions only. Each throws at
construction when given the other kind, pointing to the right method. For `.chain()`
that's essential: a callable atomic passed to it would otherwise be _called_ with the
decoded value as its options. For `.pipe()` it removes the 2.x form that picked a decoder
dynamically, `.pipe((v) => (x ? d1 : d2))`, whose `D | ((v) => D)` parameter made a
callable decoder match both arms. That form becomes `.chain((v) => (x ? d1 : d2))`, which
2.x already supports at runtime. Its types need one more overload, second:

```ts
chain<V>(next: Next<V, T>): Decoder<V>;
chain<D extends Decoder<unknown>>(next: (v: T) => D): Decoder<DecoderType<D>>;
```

Without it, `.chain()` infers `V` through `DecodeResult<V> | Decoder<V>`, which fixes `V`
from the first branch and rejects `x ? point2d : point3d` with TS2322 (verified on 2.x).
The overload infers the returned decoder type as a whole, like `.pipe()` did, giving
`Decoder<[number, number] | [number, number, number]>`. It must come second: first, it
leaves `(blob, ok, err) => ...` callbacks without parameter types (implicit `any`), while
second it only kicks in once the `Next` overload has failed. `test-d` covers both shapes:
branches of the same type, and of different types.

## The options objects

`SizeOptions` and `bySizeOptions` exist. Numbers get the mirror image:

```ts
// src/lib/options.ts (next to SizeOptions)
type RangeOptions = { min?: number; max?: number; gt?: number; lt?: number };
byRangeOptions(o) -> (value: number) => string | null

sized(d, o)  = d.reject(bySizeOptions(o));   // as today
ranged(d, o) = d.reject(byRangeOptions(o));  // private
min(n, d = number) = ranged(d, { min: n });  // max(), between() likewise; all deprecated
```

`min`/`max` are inclusive, `gt`/`lt` exclusive. There are no `gte`/`lte` aliases, so each
bound has exactly one spelling, and `min`/`max` mean the same thing in `number({ min })`
as in `string({ min })` and `array(d, { min })`. There is no `size`: an exact number is
`constant(n)`. Exclusive bounds exist for floats (`number({ gt: 0 })` for a price,
`{ gt: 0, lt: 1 }` for a probability); on `integer`, `{ gt: 0 }` is just `{ min: 1 }`.

`ranged` stays private. It is what the callable number decoders apply their options with,
and what the deprecated `min`/`max`/`between` wrap; exporting it would reintroduce
`between` under a new name. `sized` stays public, since it applies to anything with a
length and has no replacement.

One options object per family, holding everything the library knows about the constraint.
That is what Feature 3 needs: `constrain` replaces the bare `.reject()` here so the same
options also produce `minLength`/`maximum`, without a single call site repeating the
bound.

## Constraint-first regex atomics

`sized(hexadecimal, { size: 64 })` runs the regex over the whole string and only then
checks the length. The callable form recomposes in the cheap-first order, exactly as
`array(d, opts)` checks length before items:

```ts
export const hexadecimal = callable(
  regex(HEX_RE, { message: HEX_MSG }),
  (self, o) => regex(HEX_RE, { ...o, message: HEX_MSG }), // length first, regex second
);
hexadecimal({ size: 64 });
```

The `configure` callback owns the composition, so any string atomic can take the same
treatment without touching the core. In 3.0, `nonEmptyString`, `decimal`, `hexadecimal`
and `identifier` all get size options this way. There is no numeric shorthand: it's
always `hexadecimal({ size: 24 })`, never `hexadecimal(24)`.

`regex` itself becomes `regex(re, { min, max, size, message? })`: `SizeOptions` plus an
optional message, checked length first, regex second. Everything after the pattern is
optional, so `regex(/^\d+$/)` works too (message: `Must match /^\d+$/`). `regex(re, msg)`
stays as shorthand for `regex(re, { message: msg })`, told apart by `typeof` on the second
argument.

```ts
regex(/^[a-z]+$/, { max: 20, message: 'Must be lowercase' });
regex(/^[a-z]+$/, 'Must be lowercase'); // shorthand
```

`startsWith` and `endsWith` are free functions, so they take `SizeOptions` positionally,
like `array(d, opts)`, with the same length-first order. Bounds count the whole string,
prefix included, matching `sized()` and the emitted `maxLength`. No numeric shorthand here
either: never `startsWith('henk_', 24)`. The return type keeps its template literal:

```ts
startsWith('henk_', { size: 24 }); // Decoder<`henk_${string}`>
```

## `trimmed`

Form input wants "a name, 1 to 100 characters, not counting the spaces around it".
`string({ min: 1 })` accepts `'   '`, and `nonEmptyString` accepts `'  a  '` and hands
back the spaces. The callable pattern gives this a one-line home:

```ts
export const trimmed = callable(
  string.transform((s) => s.trim()),
  (self, o) => sized(self, o), // checks the trimmed value
);

trimmed; //                      '  hi  ' → 'hi'
trimmed({ min: 1, max: 100 }); // '   '    → Too short
```

The options constrain the decoded value, which is the rule for every callable atomic: for
most others the decoded value _is_ the input, so the distinction never showed. `numeric`
is the other exception: `numeric({ max: 100 })` bounds the number, not the string's
length. It isn't a special case here either, since `sized` is a `.reject()` and rejects always see the
output. The same goes for the schema: `trimmed` is not readonly, so `constrain`
(Feature 3) publishes no `minLength`/`maxLength` on the input, which is correct, because
`'  ab  '` passes `{ max: 3 }`.

Not `string({ trim: true })`: that would make `string` a transforming decoder for some
options, and it would stop being readonly depending on an argument. Two names keep
"validates" and "normalizes" apart.

# Feature 2: Readonly

Most decoders only check their input and then copy it anyway. `exact`, `inexact`, `array`,
`tuple`, `record` and `json` all rebuild a structure that was already correct. A readonly
decoder hands the input back by reference instead, which makes composite decoding 2–3×
faster and makes `json.verify(input) === input` true. It is also the fact that lets a
constraint on the decoded value be published as a constraint on the input (Feature 3).

`isReadonly` is a static guarantee: `true` means the input is never copied, for any input.
`false` promises nothing either way; the decoder may copy, or may hand back the input
anyway.

## By construction, never by assertion

There is no `readonly: true` flag anyone can set. Readonly-ness enters the system through
exactly one door:

```ts
// The only public readonly root. A type guard can only accept or reject; the accepted value IS the input.
export function defineReadonly<T>(
  guard: (blob: unknown) => blob is T,
  msg: string,
  schema?: SchemaDef,
): ReadonlyDecoder<T>;

export const string = callable(defineReadonly(isString, 'Must be string', STRING), sized);
export const boolean = defineReadonly(isBoolean, 'Must be boolean', { type: 'boolean' });
```

`define(fn)` stays for custom acceptance functions and is never readonly, because the
closure is opaque. A custom validate-only combinator is written as `pojo.reject(fn)` or
`unknown.refine(guard, msg)`, which are readonly because `reject`/`refine` cannot change
the value.

Every combinator derives its flag from its children and uses that same boolean to pick its
code path, so the flag and the behaviour cannot disagree:

```ts
export function exact(fields) {
  const keys = Object.keys(fields);
  const decodes = keys.map((k) => fields[k].decode); // captured once; loop calls closures directly
  const ro = keys.every((k) => fields[k].isReadonly);
  return make(
    (blob) => {
      /* pojo check, __proto__ and extra-key checks as today */
      const out = ro ? null : {}; // null = validate only
      const ann = decodeFields(keys, decodes, obj, out);
      return ann ? err(ann) : ok(ro ? obj : out); // readonly: hand back the input itself
    },
    ro,
    { type: 'object', properties: fields, additionalProperties: false },
  );
}
```

One `decodeFields(decoders, keys, obj, out | null)` loop serves `object`, `exact`, and
`inexact`, keeping error messages byte for byte. With `out === null` it only validates.
"Missing key" is exactly "the field decoder rejected `undefined`".

Handing back the input means a readonly `exact()`/`inexact()` keeps explicitly `undefined`
keys, and keeps the input's key order instead of the definition's. `object()`, which
always copies, keeps the normalized shape.

`object()` is never readonly, because it strips unknown keys: its output is not always its
input. That only means it _may_ copy, not that it must. The implementation is free to copy
only when needed, e.g. hand back the input itself when it has no unknown keys and all
fields are readonly, and build a stripped copy only when there is something to strip. The
flag stays `false`, since it can't promise that for every input.

`inexact()` takes an optional second argument, a decoder for the unknown keys:
`inexact({ id: uuid }, json)` decodes to `{ id: string } & Record<string, JSONValue>`. It
is `record(rest)` for the keys the fields don't name, run through the same loop. Without
it, unknown keys pass through as `unknown`, as today. The rest decoder takes part in
readonly-ness like any field, and in the schema it becomes `additionalProperties`.

The standard library gains `jsonYolo`: `Decoder<JSONValue>` without the deep check, i.e.
`unknown.refineType<JSONValue>()`. It does not really decode anything, so the docs flag it
as use-with-caution, but it is the pragmatic choice when a payload is known to come from
`JSON.parse` and walking it again is pure cost: `inexact({ id: uuid }, jsonYolo)`. It is
readonly by construction, and its schema is `{}`, since it accepts anything.

The two places a factory hides the child from static analysis, `lazy()` and `select()`,
take an explicit `{ readonly: true }` that is type-checked (`() => ReadonlyDecoder<T>`)
and verified at resolution: once for `lazy()`, per selection for `select()`. A mismatch
(only possible through casts or `any`) throws a setup error. `lazy()` memoizes its
factory, which also fixes `jsonObject` constructing a fresh `record()` decoder per nested
object per decode.

```ts
const jsonObject = lazy(() => record(json), { readonly: true });
const tree = json.verify(input);
tree === input; // true: nothing was copied
```

## At the type level: `ReadonlyDecoder<T>`, no second type parameter

`Decoder<T>` keeps exactly one type parameter. `ReadonlyDecoder<T>` is a real interface
that narrows the flag and nothing else, in the shape TS users already know from
`ReadonlyArray` and `ReadonlyMap`:

```ts
interface Decoder<T> {
  readonly isReadonly: boolean;
  decode(blob: unknown): DecodeResult<T>;
  verify(blob: unknown, formatter?: Formatter): T;
  value(blob: unknown): T | undefined;

  // Readonly-preserving: one overload per receiver kind, picked by `this`
  refine<N extends T>(
    this: ReadonlyDecoder<T>,
    p: (v: T) => v is N,
    msg: string,
  ): ReadonlyDecoder<N>;
  refine(this: ReadonlyDecoder<T>, p: (v: T) => boolean, msg: string): ReadonlyDecoder<T>;
  refine<N extends T>(p: (v: T) => v is N, msg: string): Decoder<N>;
  refine(p: (v: T) => boolean, msg: string): Decoder<T>;
  reject(
    this: ReadonlyDecoder<T>,
    f: (v: T) => string | Annotation | null,
  ): ReadonlyDecoder<T>;
  reject(f: (v: T) => string | Annotation | null): Decoder<T>;
  describe(this: ReadonlyDecoder<T>, msg: string): ReadonlyDecoder<T>;
  describe(msg: string): Decoder<T>;
  refineType<S extends T>(this: ReadonlyDecoder<T>): ReadonlyDecoder<S>;
  refineType<S extends T>(): Decoder<S>;

  // Readonly only if both sides are
  pipe<V>(this: ReadonlyDecoder<T>, next: ReadonlyDecoder<V>): ReadonlyDecoder<V>;
  pipe<D extends Decoder<unknown>>(next: D): Decoder<DecoderType<D>>;

  // Readonly-destroying
  transform<V>(f: (v: T) => V): Decoder<V>;
  chain<V>(next: Next<V, T>): Decoder<V>;
  chain<D extends Decoder<unknown>>(next: (v: T) => D): Decoder<DecoderType<D>>;
}

/** Validates without copying: `verify(x)` returns `x` itself. */
interface ReadonlyDecoder<T> extends Decoder<T> {
  readonly isReadonly: true;
}
```

On a concrete receiver the overload resolves right away, so hovers read
`ReadonlyDecoder<string[]>` and `ReadonlyDecoder<{ a: string; b: number[] }>`. A callable
atomic loses its call signature after a method call (`string.refine(...)` is a plain
`ReadonlyDecoder<string>`), so `string.refine(p, 'x')({ max: 5 })` doesn't compile. See
ROADMAP-DECISIONS.md for why this isn't a conditional `Like<this, X>` return type.

Free-function combinators follow the same pattern, with the readonly overload first:

```ts
function array<T>(d: ReadonlyDecoder<T>, opts?: SizeOptions): ReadonlyDecoder<T[]>;
function array<T>(d: Decoder<T>, opts?: SizeOptions): Decoder<T[]>;

function either<Ds extends readonly ReadonlyDecoder<unknown>[]>(
  ...ds: Ds
): ReadonlyDecoder<DecoderType<Ds[number]>>;
function either<Ds extends readonly Decoder<unknown>[]>(
  ...ds: Ds
): Decoder<DecoderType<Ds[number]>>;

function exact<Ds extends Record<string, ReadonlyDecoder<unknown>>>(
  ds: Ds,
): ReadonlyDecoder<ObjectType<Ds>>;
function exact<Ds extends Record<string, Decoder<unknown>>>(
  ds: Ds,
): Decoder<ObjectType<Ds>>;
```

Internally, they build their decoder with `make(fn, isReadonly)`, deriving the flag from
their children at construction. A readonly container hands back its validated input, which
is the one place a cast is needed (`inputs as T[]`): TS can't know that every item was
accepted as-is, but the readonly flag of the items guarantees it.

Requiring readonly works as you'd expect:

```ts
function needsRo<T>(d: ReadonlyDecoder<T>) {
  /* ... */
}
needsRo(exact({ a: string, b: array(number) })); // ok
needsRo(object({ a: string })); // error: object() strips keys, never readonly
needsRo(exact({ a: string.transform((s) => s) })); // error
```

A generic helper that calls methods on a decoder it receives does not preserve
readonly-ness: inside `function f<D extends Decoder<string>>(d: D)`, `d.refine(...)` picks
the `Decoder<string>` overload. That's accepted, since such a helper can't promise
readonly anyway.

Constraints stay `Decoder<unknown>`, never `Decoder<any, any>`, which would leak `any`
into inferred field types.

# Feature 3: Schema

`schema` is a plain JSON Schema definition whose child positions hold decoders ("holes"),
so composition is zero-copy and the public vocabulary is JSON Schema itself, not a private
AST.

## Who consumes a generated schema

Four consumers, and they do not want the same thing:

1. **LLM structured output and tool parameters.** `input_schema` on a tool call,
   `response_format: { type: 'json_schema' }`. The schema steers generation; the decoder
   still validates what comes back. (Also why `exact` matters here: OpenAI's strict mode
   requires `additionalProperties: false`.)
2. **OpenAPI documents, prose docs, client codegen.** Read by humans and by
   `openapi-typescript`.
3. **A second validator in another runtime** — a gateway, a Go service, a schema registry
   — rejecting junk before it reaches the app.
4. **Form generators, fixtures, fuzzers.**

In all four the decoder remains the authority: decoders validates input and has no
serialization story, so a generated schema is an approximation published upstream, never
the gate. That reorders the priorities. A loose schema costs a retry, a vaguer doc, or
some junk arriving at a decoder that was going to run anyway; no schema at all costs the
whole feature. **Emittability beats tightness**, and soundness is what protects consumer 3
— the one consumer that is already running a second check.

The two classes also want opposite directions of error. Generators (1, 4) are safe with a
schema _narrower_ than the decoder: everything they produce is accepted. Filters (3) need
a schema _wider_ than the decoder, or they drop valid traffic. One schema cannot serve
both except by being exact, so the invariant goes on the unrecoverable side: too wide is
caught by the decoder downstream, too narrow is caught by nobody. Wanting an LLM to emit
better values is therefore never an argument for narrowing a schema — that tension is
resolved by `constrain` growing real keywords.

It also rules out one option that looks reasonable in isolation: `false` as a stand-in for
"no schema". `{}` is useless-but-harmless to a generator; `false` is _unsatisfiable_, so
an LLM handed a `false` field can never produce a valid object and a form generator
renders an impossible field. `false` is correct only where accepting nothing is the point
(`never`, `fail`). That is why `date`/`bigint`/`instanceOf` throw instead: a
`Date`-accepting decoder in a wire-data position is a modeling error, and an error naming
the field path helps more than any schema could.

## The schema is an over-approximation

One invariant governs everything below: **everything a decoder accepts satisfies its
schema, but not everything satisfying its schema is accepted.**

The gap is unavoidable, because the narrowing happens inside opaque closures.
`string.refine((s) => s.length > 3, '...')` shares `string`'s `{ type: 'string' }` by
reference and rejects `'ab'`. `.transform(f)` is `chain(noThrow(f))`, so it rejects
whenever `f` throws — it narrows acceptance as well, and its inherited schema stays true
without being tight. Same for `.reject(fn)`, `.chain(fn)` and `define(fn, schema?)`.

The direction is the useful one. A generated schema never rejects something the decoder
would have accepted, so it is safe as documentation, as an OpenAPI request shape, as LLM
tool-call parameters, and as a gateway pre-filter that cannot drop valid traffic. It is a
necessary condition, never a sufficient one, and it never replaces running the decoder.
`constrain` exists to close the gap where it is worth closing: `string({ min: 2 })` emits
`minLength` rather than hiding the bound in a predicate, which is the whole reason the
options object has to be a single source of truth.

## What lives in a `SchemaDef`

```ts
/**
 * No JSON Schema describes this decoder at all (`date`, `instanceOf`, `bigint`):
 * generation throws rather than lying. `Symbol.for` so it survives duplicate copies of
 * the library, like the `isDecoder` brand.
 */
export const UNREPRESENTABLE: unique symbol = Symbol.for('decoders.unrepresentable');

/**
 * A JSON Schema definition, as stored on a decoder. Child positions (`items`,
 * `properties.*`, `anyOf[]`, ...) hold a `Decoder` instead of a nested definition: a
 * "hole" the walker resolves only when a schema is actually asked for, so composing
 * decoders copies no schema. `false` is the JSON Schema that accepts nothing;
 * `UNREPRESENTABLE` is the absence of one.
 *
 * A definition written by hand (`{ type: 'string' }`) is just the hole-free case.
 */
type SchemaDef = typeof UNREPRESENTABLE | false | { readonly [keyword: string]: unknown };
```

`SchemaDef` is hand-rolled rather than `JSONSchema7` from `@types/json-schema`, because a
`SchemaDef` is not a JSON Schema: its child positions hold decoders, which a closed schema
interface rejects. The only type the Standard Schema spec offers is the converter's return
type (`Record<string, unknown>`), and that describes what the walker produces, not what a
decoder stores. Those are two different types: resolving the holes is exactly what turns a
`SchemaDef` into real JSON, so the walker returns decoders' own exported `JSONObject`.

An atomic points at a frozen module-level object of ordinary JSON Schema keywords:

```
string.schema                       { type: 'string' }
string({ min: 2, max: 10 }).schema  { type: 'string', minLength: 2, maxLength: 10 }
uuid.schema                         { type: 'string', format: 'uuid' }
hexadecimal.schema                  { type: 'string', pattern: '^[0-9A-Fa-f]+$' }
natural.schema                      { type: 'integer', minimum: 0 }
constant('yes').schema              { const: 'yes' }
oneOf(['a', 'b']).schema            { enum: ['a', 'b'] }
undefined_.schema                   { const: undefined }
never.schema                        false
date.schema                         UNREPRESENTABLE
```

A composite stores its own keywords plus the child decoders themselves, never their
resolved schemas:

```
array(string, { max: 10 }).schema
    { type: 'array', items: «string decoder», maxItems: 10 }

exact({ id: uuid, tags: array(string) }).schema
    { type: 'object', additionalProperties: false,
      properties: { id: «uuid decoder», tags: «array decoder» } }

either(string, number).schema   { anyOf: [«string dec», «number dec»] }
optional(string).schema         { anyOf: [«undefined_ dec», «string dec»] }
record(number).schema           { type: 'object', additionalProperties: «number dec» }
```

`properties` and `anyOf` are themselves a plain object and a plain array; the holes are
their values, one level down. So a keyword's value is one of: an ordinary JSON value, a
`Decoder`, or `undefined` (only in `{ const: undefined }`, which drives `required` and
throws at the root). `additionalProperties` is why a keyword's value type is `unknown` and
not something tighter: `false` for `exact`, a decoder for `record`, same keyword.

## Why holes, and not the child's resolved definition

Inlining `items: string.schema` would cost the same and read easier, and for
`array(string)` it would work. It fails on recursion: when `array(json)` is constructed
inside `lazy(() => ..., { readonly: true })`, `json.schema` does not exist yet, and
forcing it re-enters the factory. A cyclic decoder graph has no finite inlined tree; that
is what `$ref` is for. A hole also keeps the child _decoder_ reachable, which the walker
needs for questions no keyword bag can answer: does this field admit absence (`required`),
is this node a `lazy()` to hoist into `$defs`, have I seen this exact node before.

Atomics point at module-level frozen constants; `refine`/`reject`/`describe` share the
parent's definition by reference. `false` means "accepts nothing" and is pruned inside
`anyOf`; `UNREPRESENTABLE` means generation throws with a clear message.

## Lifting constraints into keywords

One internal helper ties readonly to schema, and is the payoff for having put every
constraint in an options object back in Feature 1:

```ts
type Narrow = (cur: SchemaDef) => SchemaDef;

/** `.reject(fn)`, plus: when the decoder is readonly, narrow its schema.
 *  A fact about the decoded value is a fact about the input iff the input is handed back. */
function constrain<T, D extends Decoder<T>>(d: D, rejectFn, narrow: Narrow): D {
  const r = d.reject(rejectFn);
  if (!d.isReadonly) return r; // the predicate saw the output, not the input
  return make(r.decode, true, narrow(d.schema));
}

/** The only `Narrow` anyone normally writes: spread keywords over the current ones.
 *  `false` and `UNREPRESENTABLE` pass through, so no call site repeats that check. */
const merge =
  (delta: object | ((cur: object) => object)): Narrow =>
  (cur) =>
    cur === false || cur === UNREPRESENTABLE
      ? cur
      : { ...cur, ...(typeof delta === 'function' ? delta(cur) : delta) };
```

The predicate and the keywords come out of the same options, side by side with the type:

```ts
// src/lib/options.ts
bySizeOptions(o)      -> (value) => string | null                           // as today
sizeKeywords(o, cur)  -> { minLength, maxLength } | { minItems, maxItems }  // keyed off cur.type
                       | { minProperties, maxProperties }                  // (record),
                                                                           // tightened against cur

// src/lib/options.ts
byRangeOptions(o), rangeKeywords(o, cur) -> { minimum, maximum,           // likewise
                                              exclusiveMinimum, exclusiveMaximum }

sized(d, o)  = constrain(d, bySizeOptions(o),  merge((cur) => sizeKeywords(o, cur)));
ranged(d, o) = constrain(d, byRangeOptions(o), merge((cur) => rangeKeywords(o, cur)));
```

That is the only change Feature 3 makes to Feature 1: `sized` and `ranged` stop being a
bare `.reject()`. Every callable atomic, and every `min`/`max`/`between`, gains schema
keywords without a line of its own.

Tightening lives in `sizeKeywords`/`rangeKeywords`, beside the predicate enforcing the
same bound, and not in a generic schema-merge helper: taking the larger of two `minimum`s
is a fact about bounds, not a law of merging JSON Schema. That keeps the generic path a
literal spread with nothing hidden in it.

So `uniqueArray(number, { max: 3 })` adds no `maxItems` to the array input schema, because
the constraint is on the deduplicated output and the decoder is not readonly
(`[1, 1, 1, 1, 2]` is accepted); and `natural({ min: -5, max: 10 })` yields
`{ type: 'integer', minimum: 0, maximum: 10 }` — the `0` survives because `rangeKeywords`
saw it in `cur`. And the constraint-first regex atomics from Feature 1 come out right for
free:

```ts
hexadecimal({ size: 64 }); // { type: 'string', pattern: '^[0-9A-Fa-f]+$', minLength: 64, maxLength: 64 }
```

## There is no output schema

A decoder stores what it accepts and nothing about what it returns. JSON Schema is the
language of the wire; TypeScript is the language of the value, and `T` already describes
the output better than JSON Schema can — `Set<number>`, `Date`, `Map`, a branded string
are all exact in TS and inexpressible in JSON Schema. A second, output-side schema asks
JSON Schema to do TypeScript's job, the mirror image of the `Decoder<T, I>` input
parameter that 2.x dropped for the same reason.

It also pays for itself in what it removes. `.transform(f)` receives an opaque closure, so
no runtime can know that `(s) => s.toUpperCase()` returns a string; an output side would
make every transformed decoder `UNREPRESENTABLE`, which is the common case rather than the
rare one. With one field, transform is schema-transparent:

```
string.transform((s) => s.toUpperCase()).schema   { type: 'string' }
numeric.schema                                    { type: 'string', pattern: '^[0-9]+$' }
uniqueArray(number).schema                        { type: 'array', items: «number dec» }
```

all correct: that is exactly what each one accepts. `UNREPRESENTABLE` then means only
"this decoder's accepted input is not JSON" — `date`, `instanceOf`, `bigint`, `select()` —
where throwing is honest and unsurprising, instead of leaking into every `.transform()` in
every app.

`~standard.jsonSchema` asks two different questions about the same decoder. `input()` is
"what may I send in?", describing the value _before_ decoding; `output()` is "what comes
back out?", describing the decoded value _as JSON_. They diverge exactly when decoding
changes the value. zod, for comparison, emits `required: ['a']` on the output side of
`z.object({ a: z.string().default('x') })` because the default has filled the key in, adds
`additionalProperties: false` because it stripped unknown keys, and throws on the output
side of any `.transform()`.

For decoders there are three cases, and only the first is free:

| decoder                                    | `input()`                  | `output()`                                                         |
| ------------------------------------------ | -------------------------- | ------------------------------------------------------------------ |
| `string`, `exact({…})`, anything readonly  | `{ type: 'string' }`       | **identical** — the input value is handed back by reference        |
| `object({ a: string })`                    | object, extra keys allowed | `additionalProperties: false` — knowable, deliberately not tracked |
| `optional(string, 'x')`                    | key may be absent          | key always present — knowable, deliberately not tracked            |
| `isoDate`                                  | `{ type: 'string', … }`    | a `Date` — no JSON schema exists in principle                      |
| `string.transform((s) => s.toUpperCase())` | `{ type: 'string' }`       | truly `{ type: 'string' }`, but the closure is opaque              |

Readonly is the row that makes this cost nothing. A readonly decoder returns the input
object itself rather than a copy, so the output value _is_ the input value, and the input
schema describes it exactly rather than approximately — and `isReadonly` already exists
for the copy-avoidance feature.

`@standard-schema/spec@1.1.0` settles how to spell the rest. `Converter.output` is
required, not optional, so it has to exist; its return type is `Record<string, unknown>`
with no `undefined` in it; and its own doc comment sanctions the alternative — _"May throw
if conversion is not supported."_ So:

```ts
output(options) {
  if (!this.isReadonly) throw new Error("...no output schema: this decoder transforms its input");
  return this.input(options);
}
```

Still no stored field. Two more constraints from the same interface, worth writing down
because both bite elsewhere: `input()` returns `Record<string, unknown>` too, so a
**boolean schema cannot cross the `~standard` boundary** — `never`/`fail` must be spelled
`{ not: {} }` there, even though decoders' own `toJSONSchema()` returns `false` (this is
why zod emits `{ not: {} }`; it is forced by the signature, not a style choice). And
`Options.target` is required, so the `~standard` path always supplies one, which argues
for defaulting it on decoders' own export rather than making direct callers name a draft.

The consumers that call `output()` at all are the ones that care what comes back: OpenAPI
_response_ schemas, a framework validating outgoing payloads, codegen for what a client
will receive. Given how often decoders' outputs are TS-only values, "it throws" is the
honest answer across most of the library, and `toJSONSchema()` stays input-only.

What this gives up: `object()` cannot advertise that it strips extra keys (but as an input
schema "extra keys allowed" is the truth, and is what a request validator wants);
`optional(d, 'x')` loses its default (JSON Schema's `default` annotation keyword says it
better on the input side anyway); and generating OpenAPI _response_ schemas from a decoder
is out of scope, which it effectively was already at the first `Date`.

## The walker

Generation is a small walker (well under 200 lines, ~1 KB gzipped) reached only from
`~standard.jsonSchema` and an exported
`toJSONSchema(decoder, { target }): JSONObject | boolean`. It resolves holes with an
in-progress set, hoists every `lazy()` node into `$defs` (a recursive root emits
`$ref: '#'`), computes `required`, and rewrites `prefixItems`/`$defs` for draft-07. Apps
that never call it pay one pointer per decoder.

`required` is computed by probing the field decoder, not by reading its schema: a key is
optional iff `d.decode(undefined).ok`, which is the same oracle the decode path already
uses for "missing key", so the two cannot disagree. A stored `admitsAbsence` flag would
not be better — `.refine(p, msg)`, `.transform(f)`, `define(fn)` and `.pipe(d)` all hide
the answer behind an opaque closure, so the flag would have to guess exactly where an
`anyOf` walk guesses, while costing a field on every decoder that the decode path never
reads. Even the cases that look derivable are easy to get wrong by hand: `optional(d)` and
`nullish(d)` admit absence unconditionally, but `nullable(d)` is `either(null_, d)` and
admits it only when `d` does, so `nullable(string)` is required while `nullable(unknown)`
is not. Probing is exact there, is O(1) (`undefined` is a scalar; every composite rejects
it on its first type check), and still works when the schema is `UNREPRESENTABLE`. A throw
is treated as "required". The walker still recognizes `{ const: undefined }`
syntactically, but only to prune it, so `optional(string)` emits `{ type: 'string' }` and
drops the key from `required`.

```ts
const user = exact({
  id: uuid,
  name: string({ min: 1 }),
  tags: array(string, { max: 10 }),
});
toJSONSchema(user);
// { type: 'object', additionalProperties: false, required: ['id', 'name', 'tags'],
//   properties: { id: { type: 'string', format: 'uuid' },
//                 name: { type: 'string', minLength: 1 },
//                 tags: { type: 'array', items: { type: 'string' }, maxItems: 10 } } }
```

## Testing the schema against the decoder it came from

Sketch, to be worked out properly later. Two properties relate a generated schema to its
decoder, and they are not equally true:

```
soundness   ∀ d, ∀ input ∈ parsed-json:  d accepts input  ⟹  ajv(toJSONSchema(d)) accepts input
tightness   ∀ d, ∀ input ∈ parsed-json:  ajv(toJSONSchema(d)) accepts input  ⟹  d accepts input
```

Both are quantified over `parsed-json` — every value reachable through `JSON.parse` — and
that restriction is load-bearing, not a technicality. It is what makes `date` (accepts a
`Date`), `anyNumber` (accepts `NaN`) and `undefined_` non-issues by construction instead
of by special case: their disagreements have no counterexample inside the domain. Note
that "has no JSON literal" is _not_ the same line: `JSON.parse('1e400')` is `Infinity`, so
`Infinity` is in `parsed-json` and `NaN` is not.

Soundness is the over-approximation invariant in testable form. It must hold for every
decoder with a representable schema, so it is worth fuzzing across the whole library with
`fast-check` and a real validator, generating inputs both from the schema and from the
decoder's own accepted shapes.

Tightness does not hold in general — `string.refine((s) => s.length > 3, '...')` emits
`{ type: 'string' }` and rejects `'ab'` — so it cannot be a blanket property. It is an
opt-in list of decoders that claim to be exact, which is precisely the set `constrain` is
meant to grow: a decoder falling off that list is the signal that a constraint went into
an opaque predicate where it could have been a keyword.

### Vocabulary for a disagreement

A fuzz run reports a direction and a counterexample; a human supplies the rest. Naming the
three axes is what keeps "this one is fine, that one is a bug" from being a case-by-case
shrug.

**Direction**, named for the consequence:

- **SLACK** — schema ⊋ decoder. Junk clears the schema and the decoder rejects it. Always
  fine, never recorded: the decoder is downstream and is the backstop.
- **LOSS** — schema ⊊ decoder. Valid input dies upstream and never reaches the decoder.
  The only direction that needs a verdict, because nothing is downstream of it. It is also
  the failure that is invisible in production: it looks like missing traffic, not like a
  schema mismatch.

**Cause**, which decides a LOSS:

| cause                    | example                                                    | verdict                                                           |
| ------------------------ | ---------------------------------------------------------- | ----------------------------------------------------------------- |
| `inexpressible`          | primality, `.refine`, `prep`                               | only ever produces SLACK — fine, permanent                        |
| `schema-defect`          | `format: 'email'` vs our own regex                         | must fix — a better keyword exists (`pattern`)                    |
| `implementation-defined` | `format` is annotation-only unless the consumer enables it | must fix — do not emit a keyword whose meaning the consumer picks |
| `decoder-defect`         | `"2024-02-31T00:00:00Z"` decodes to Mar 2, no error        | deferred — allowed only as a recorded, deferred decoder fix       |

So LOSS + `decoder-defect` is the _only_ combination that may be knowingly accepted, and
every entry is a TODO with a named fix rather than a permanent exemption. The test rule is
then mechanical: a LOSS whose decoder is on the list passes, any other LOSS fails.

The justification for accepting one is not "we don't care about those values" but the
stronger claim that the lost set lies inside the decoder's _accidental-acceptance surface_
— values it accepts by accident rather than by design, where decoding produces a wrong
answer anyway. If a lost value is meaningful to any consumer (a legacy client sending
`01/01/2024`, an address with a quoted local part), it is a defect, because "meaningless"
has to hold for every consumer and we do not know who they are.

Record format, in user-facing docs rather than a test fixture — every entry is a value
somebody can no longer send through a gateway built from our schema:

```
isoDateString — LOSS in parsed-json, cause: decoder-defect
  counterexamples: invalid calendar dates ("2024-02-31T00:00:00Z" decodes to Mar 2)
  deferred fix: reject invalid calendar dates in 3.x
```

If the `isoDateString` fix lands in 3.0 the list starts empty, which is the best state to
enforce from: the first entry has to argue for itself. A list that grows is the signal
that `constrain` is not growing fast enough.

### What a first pass already found

Checked by hand against ajv 8 + `ajv-formats`, using the regexes in `src/strings.ts` and
`src/dates.ts`. The `format` row of the propagation table does not survive it:

| decoder         | table says            | counterexample (decoder accepts, schema rejects)                               | cause                    |
| --------------- | --------------------- | ------------------------------------------------------------------------------ | ------------------------ |
| `isoDateString` | `format: 'date-time'` | `"2024-02-31T00:00:00Z"`                                                       | `decoder-defect`         |
| `isoDateString` | `format: 'date-time'` | `"2024-01-01T00:00:00+0200"` under a strict RFC 3339 validator (ajv allows it) | `implementation-defined` |
| `email`         | `format: 'email'`     | `"\"weird name\"@b.com"`, `"x@[192.168.0.1]"`                                  | `schema-defect`          |
| `uuid`          | `format: 'uuid'`      | none — sound (merely loose: accepts `…-92d3-…`)                                | —                        |

The comment at `src/dates.ts` claiming over-matched dates "will be caught by JS Date's
internal validations" is wrong for rollover cases: `new Date('2024-02-31T00:00:00Z')` is
Mar 2, not `NaN`, so the refine passes.

The number family is clean, all SLACK: ajv's `type: 'number'` is a bare `typeof` check and
accepts `NaN` and `Infinity`, `type: 'integer'` accepts `Infinity` too, and
`{ minimum: 0 }` accepts `-0` where `nonNegativeNumber` rejects it. Unsafe integers agree
on both sides.

### Prior art, measured

zod 4.6.5 and arktype 2.2.3, for the same two shapes (`prep(Number, number)` and
`number.refine(isPrime)`):

|                    | `numberish`                     | `prime`                     |
| ------------------ | ------------------------------- | --------------------------- |
| zod                | `{ type: 'number' }` — **LOSS** | `{ type: 'number' }`        |
| arktype            | throws `{code:'morph'}`         | throws `{code:'predicate'}` |
| arktype `fallback` | `{}`                            | `{ type: 'number' }`        |

zod's is a real soundness violation, not a looseness:
`z.preprocess((x) => Number(x), z.number())` accepts `'42'` and `null`, and its schema
rejects both — `io: 'input'` and `unrepresentable: 'any'` do not change it. It describes
the inner schema and drops the fact that preprocessing happened. That is the failure mode
of declining to model the "unknown input" state at all, and the argument for
`prep`/`select` carrying ∅ rather than their child's definition.

arktype's `toJsonSchema({ fallback })` is the store-knowledge / widen-at-emit-time split
already shipped: it throws by default, and the thrown payload carries `base`, the schema
computed so far, so `fallback: (ctx) => ctx.base` recovers exactly the behaviour proposed
here (`{}` for a morph, `{ type: 'number' }` for a predicate), keyed by `code`. Worth
copying as the shape of a future `toJSONSchema(d, { onUnknown })`.

Neither library emits boolean `false` for a type. zod spells the empty set `{ not: {} }`,
arktype spells it `{ enum: [] }`, and zod's empty union is `{ anyOf: [] }` — the latter
two do not compile in ajv at all (`enum must have non-empty array`,
`anyOf must NOT have fewer than 1 items`). Boolean `false` appears in both, but only in
structural slots (`additionalProperties: false`, and `items: false` closing a zod tuple).
So `false` for `never`/`fail` is both exact and the best-behaved spelling available.

# Feature 4: Deep input

`.decode()` documents that it "will never fail and instead return a result type". Deeply
nested input breaks that. `JSON.parse` has no depth limit, and decoders recurse once per
level, or more than once for `either`-heavy schemas like `json`.

2.x already has lazy annotations (main, 68973620): a discarded `either()` branch no longer
deep-copies the input, which made `optional(array(string))` on 200k items go from 55 ms to
1.8 ms. That needs merging into this branch before any of the work below. What's left, as
measured on main (Node 24, default stack size):

| input                                        | result                 |
| -------------------------------------------- | ---------------------- |
| `json`, valid, nested arrays, depth ≥ 1,173  | throws `RangeError`    |
| `json`, valid, nested objects, depth ≥ 1,563 | throws `RangeError`    |
| fat recursive schema¹, ≥ 759 cycles          | throws `RangeError`    |
| `json`, invalid leaf, depth 100 / 300        | rejects in 37 / 258 ms |

¹ `lazy(() => object({ a: optional(object({ b: array(Fat) })) }))`

The first row is about 2.3 KB of JSON. The last row grows quadratically. Two changes fix
this, and they only work as a pair.

## A depth guard in `lazy()`

`lazy()` is the only place where unbounded recursion enters a schema, so a counter there
costs nothing on the hot path. The counter alone isn't enough, because stack frames per
recursion cycle depend on the schema's shape: the fat schema above overflows at 759
cycles, before a limit of 1000 would fire. So the guard also catches `RangeError` as a
backstop:

```ts
export function lazy<T>(decoderFn: () => Decoder<T>): Decoder<T> {
  return define((blob, _, err) => {
    if (depth >= MAX_DEPTH) return err('Too deeply nested');
    depth++;
    try {
      return decoderFn().decode(blob);
    } catch (e) {
      // A fat cycle can exhaust the stack before the counter reaches MAX_DEPTH
      if (e instanceof RangeError) return err('Too deeply nested');
      throw e;
    } finally {
      depth--;
    }
  });
}
```

A downside: a user's `.transform()` that throws a genuine `RangeError` (say
`new Array(-1)`) gets reported as `Too deeply nested`.

**The guard must not ship on its own.** Prototyped on top of main:

| input                              | main           | main + guard        |
| ---------------------------------- | -------------- | ------------------- |
| `json`, valid, depth 5,000         | throws in 6 ms | throws in 2,480 ms  |
| `json`, valid, depth 50,000        | throws in 3 ms | throws in 2,190 ms  |
| fat recursive schema, 2,000 cycles | throws in 6 ms | rejects in 2,360 ms |

A 2 KB body that burns 2.5 s of CPU is worse than a fast 500. I think each `lazy()` frame
on the way up catches the overflow and returns an `err()`, and the `either()` above it
(`json` itself, or `optional`) then summarizes that error deeply enough to overflow again,
once per level. This hasn't been confirmed with a profiler.

## `either()` stops producing a string

`either()` builds its `Either:\n- …` text as soon as it fails, by summarizing every branch
error at every level:

```ts
const text =
  EITHER_PREFIX + errors.map((err) => nest(summarize(err).join('\n'))).join('\n');
```

`summarize()` walks everything below it, including the `Either:` text the level below
already built. That is both the quadratic failure path and the repeated overflow that
defeats the guard. Lazy annotations don't help, because `summarize()` forces them. A lazy
`text` getter doesn't help either: each level's getter forces the level below, which
cascades the same way.

The fix is for `either()` to keep its branch annotations as structure, and for `format.ts`
to render the `Either:` block once, at the top, when asked. That means adding a
union-failure kind to the public `Annotation` union
(`ObjectAnnotation | ArrayAnnotation | ScalarAnnotation | OpaqueAnnotation`). That breaks
exhaustive narrowing by users, and error text will probably move.

With both changes, `.decode()` never throws on deep input, and deep rejections are fast.
Readonly (Feature 2) doesn't change any of this: a readonly `json` still recurses per
level.

## Ruled out

- **Depth counter in `define()` instead of `lazy()`.** It holds for any schema shape
  (including hand-rolled recursion) and needs no backstop, but costs ~34% on the hottest
  path (a string-plus-regex leaf went from 13.6 to 18.3 ns/call). It would still hit the
  `either()` cascade.
- **A separate cheap validation pass** (like Zod 4.6's `.validate()`) that `either()` runs
  first. A parallel code path through every decoder, and it only helps `either()`.
- **Doing this in 2.x without touching the public union**, by stashing branch errors under
  a private symbol key on an existing annotation kind. Possible, but it's a hidden side
  channel on a public data type that 3.x would then remove. Not prototyped. 2.x documents
  the depth limit instead.

# Feature 5: `taggedUnion(key, ...branches)`

`either()` doesn't change: it tries its branches in order, in 3.x too (see
[ROADMAP-DECISIONS.md](./ROADMAP-DECISIONS.md#either-does-not-dispatch)). Dispatch lives
in `taggedUnion` only, which names the key, takes the branches as they are, and always
picks exactly one branch:

```ts
const shape = taggedUnion(
  'type',
  object({ type: constant('circle'), radius: number }),
  object({ type: constant('rect'), width: number, height: number }),
);
```

The 2.x form took an object mapping tags to branches,
`taggedUnion('type', { circle, rect })`, which made every branch spell its tag twice
(`circle:` and `constant('circle')`), with nothing checking that the two agree. Its tags
were keyed by strings, so it had no notion of an absent tag, and booleans only worked by
accident, because the scout ran the tag through `String()` (which is also why
`{ type: 'undefined' }` would select an `undefined:` branch). The branches already say
everything there is to say about the tag, so the new form reads it off them instead:

```ts
taggedUnion(
  'ok',
  object({ ok: constant(true), value: string }),
  object({ ok: optional(constant(false)), error: string }), // owns both `false` and "absent"
);
```

## Tag sets are derived from `schema`, not stored

No new field on decoders. A branch's tag set is read from the `SchemaDef` it already
carries (Feature 3): an object-shaped branch has `properties: { k: «field decoder» }`, and
the field decoder's own definition is one level further down.

| field decoder's `schema`                     | tag set for that key         |
| -------------------------------------------- | ---------------------------- |
| `{ const: x }` (`constant`, `null_`, …)      | `{x}`                        |
| `{ enum: [...] }` (`oneOf`, `enum_`)         | that set                     |
| `{ type: 'boolean' }` (`boolean`)            | `{true, false}`              |
| `{ anyOf: [...] }` (`either`, `optional`, …) | union of the members' sets   |
| `{ const: undefined }` (`undefined_`)        | `{undefined}`, i.e. "absent" |
| anything else, `∅`                           | not a tag set                |

This is safe because of the schema invariant, "everything a decoder accepts satisfies its
schema" (Feature 3): if a branch's tag set excludes `t`, the branch would have rejected
any input with tag `t`, so not trying it changes no result. `.refine`, `.reject` and
`.transform` share their parent's definition and only ever narrow what is accepted, so a
refined or transformed branch still discriminates correctly.

One subtlety: Feature 3's invariant is quantified over `parsed-json`, but dispatch runs on
anything. That's why only the rows above count as tag sets. They're the nodes that are
exact on _every_ input, not just JSON: `constant` and `oneOf` compare with `===`,
`boolean` with `typeof`. `prep` and `select` are `∅`, so a tag behind them is not a tag
set, which is correct: `prep` may turn `'yes'` into `true`.

## Checked at construction

`taggedUnion` throws when it's built, naming the branch, if:

- a branch doesn't declare `key` in its fields, or declares it through something that
  isn't a tag set (e.g. `string`, or a `prep()`), or
- two branches' tag sets overlap: `Branches 0 and 1 both accept type: 'circle'`.

So every tag maps to exactly one branch, and there is nothing to fall back to. A branch
that should only match when the tag is absent says so explicitly: `ok: optional(never)`
has tag set `{absent}`.

The 2.x object form is removed in 3.0. The second argument must be a decoder: passing a
plain object is a type error, and throws at construction for JS callers, with a message
pointing at the new form. The migration is to drop the keys. The only branches that need
more than that are ones that don't pin their own tag, which the object form reached by key
alone; the fix is adding the `constant`, which is what the docs already show.

## Decoding

`taggedUnion` is implemented directly: `pojo.decode`, then one `Map<tag, decode>` lookup
on `blob[key]`, then that branch's `decode`. An absent key reads as `undefined`, which is
how the `{absent}` tag set matches. `Map` uses SameValueZero where `constant` uses `===`;
they differ only on `NaN`, which `constant` can never accept, so no `NaN` tag is ever in
the map.

Errors:

- **Tag in no set:** one error at the key, in `oneOf`'s words:
  `Value at key 'ok': Must be true, false, or missing`. When no branch accepts "absent"
  and the key is absent, it is the ordinary `Missing key: 'ok'`.
- **Otherwise:** the one matching branch's error, verbatim.

Its inferred type is the union of the branches' types, and it's readonly iff every branch
is (`all`).

## Docs to update when this lands

- Rewrite every `taggedUnion(key, { ... })` in `docs/content` to the new form (all of
  `api/choices.mdx` and `idiomatic-decoders.mdx`).
- `idiomatic-decoders.mdx` "When the tag can be missing, use `select()`": `select()` is no
  longer needed there. The legacy branch declares its tag as absent instead:
  ```ts
  const legacyCircle = object({ kind: optional(never), radius: number }).transform(
    ({ radius }) => ({ kind: 'circle' as const, radius }),
  );
  const shape = taggedUnion('kind', circle, square, legacyCircle);
  ```
  Retitle the section (e.g. "When the tag can be missing"), and keep `select()` in the
  guide only for cases a tag can't express.

## Required tests

- **Types (`test-d/`):** an optional tag is inferred without annotations:
  ```ts
  taggedUnion(
    'ok',
    object({ ok: constant(true) }),
    object({ ok: optional(constant(false)) }),
  );
  // Decoder<{ ok: true } | { ok?: false | undefined }>
  ```
- **Types and/or runtime:** the discriminator field must be declared on _every_ branch. A
  branch that doesn't mention it is a type error, a construction-time throw, or both:
  ```ts
  taggedUnion('ok', object({ ok: constant(true) }), object({ other: string })); // ❌
  taggedUnion('ok', object({ ok: constant(true) }), object({ ok: optional(never) })); // ✅ tag set {absent}
  ```

# Feature 6: Typed `prep()` input

`prep()` hands its function `unknown`, because the result is a `Decoder<T>` and a decoder
can be handed anything. That's right when `prep()` stands alone, and wrong when it sits
behind a `.pipe()`, where the input is already known:

```ts
string.pipe(
  prep((s) => tryParseJson(base64UrlDecode(s as string)), cursorTuple).describe(
    'Must be valid cursor',
  ),
);
```

The cast is the only way to say what the pipe already guarantees.

A second type parameter on `Decoder` would fix it everywhere and cost everyone. The fix is
local instead: a `prep()` whose function takes something narrower than `unknown` is not a
decoder. It's a `Prep<I, T>`, which only `.pipe()` accepts, from a receiver whose output
is assignable to `I`:

```ts
/** Decodes an `I` into a `T`. Only usable as `.pipe()`'s argument, or on its own via `verify`. */
interface Prep<I, T> {
  readonly [prepInput]: (input: I) => void; // phantom, keeps `I` contravariant
  decode(blob: I): DecodeResult<T>;
  verify(blob: I, formatter?: Formatter): T;
  value(blob: I): T | undefined;
  describe(message: string): Prep<I, T>;
}

function prep<T, I = unknown>(
  fn: (blob: I) => unknown,
  decoder: Decoder<T>,
): unknown extends I ? Decoder<T> : Prep<I, T>;

interface Decoder<T> {
  // ...
  pipe<V>(next: Prep<T, V>): Decoder<V>; // alongside the existing overloads
}
```

`Prep` has no `unknown` input, so it can't slip into `array()`, `object()`, or `either()`,
where it would be called with anything. The unannotated form is unchanged: `I` defaults to
`unknown`, and `prep(fn, d)` is still a plain `Decoder<T>`. Runtime doesn't change: it's
the same object, only the type is narrower.

Checked against a stand-alone model of these types (TS 5, strict):

```ts
string.pipe(prep((s) => tryParseJson(b64(s)), cursorTuple)); // ok, `s: string` inferred from the receiver
string.pipe(prep((s: string) => tryParseJson(b64(s)), cursorTuple)); // ok
oneOf(['a', 'b']).pipe(prep((s: string) => s, string)); // ok, a narrower receiver
number.pipe(prep((s: string) => s, string)); // error
array(prep((s: string) => s.trim(), string)); // error: not a Decoder
array(prep((x) => String(x), string)); // ok, still Decoder<string>
prep((s: string) => s.trim(), string).verify('x'); // ok, and `verify(42)` is an error
```

One catch: inference from the receiver needs the `prep()` call to be `.pipe()`'s argument
directly. With `.describe()` chained on it, as in the example above, TS has no contextual
type for the `prep()` call and `s` falls back to `unknown`. Two ways around it, both
cast-free: annotate the parameter (`(s: string) =>`), or move `.describe()` outside the
pipe, where it describes the same failures:

```ts
string
  .pipe(prep((s) => tryParseJson(base64UrlDecode(s)), cursorTuple))
  .describe('Must be valid cursor');
```

Not breaking: today an annotated `(s: string) =>` doesn't compile at all, so no existing
call gets the new type. The schema doesn't change either: `.pipe(prep(...))` inherits the
receiver's definition, as for any non-readonly pipe, and `prep()` is still ∅ on its own.

# Feature 7: Masking

Errors echo the input back. That is what makes them good, and what makes them unsafe to
log when the input holds a password, a token, or a card number:

```ts
const login = object({ username: string, password: string });
login.verify({ username: 123, password: 'hunter2' });
// {
//   "username": 123,
//               ^^^ Must be string
//   "password": "hunter2",
// }
```

The password was fine, and still ends up in the thrown error, the error tracker, and the
logs. `masked(d)` marks a position whose value never appears in an error:

```ts
const login = object({ username: string, password: masked(string) });

login.verify({ username: 123, password: 'hunter2' });
// {
//   "username": 123,
//               ^^^ Must be string
//   "password": <masked>,
// }

login.verify({ username: 'nvie', password: 8972349894792 });
// {
//   "username": "nvie",
//   "password": <masked>,
//               ^^^^^^^^ Must be string
// }

masked(string, '***REDACTED***'); // custom placeholder
```

Decoding doesn't change: `masked(d)` accepts and returns exactly what `d` does, is
readonly iff `d` is, and shares `d`'s schema. It only changes what errors may contain.
Hiding the _decoded_ value (from a `console.log`, say) is a different feature, and a
userland one: `masked(string).transform((s) => new Secret(s))`.

## The invariant

**A value at a masked position never appears in an error.** Not in the `Annotation` on
`DecodeResult.error`, not in any formatter's output, not in Standard Schema issues, for
any input.

So masking happens when the annotation is built, not when it is formatted. `decode()`
hands out the `Annotation` itself, and it ends up in `JSON.stringify(result)`, error
trackers and custom formatters, none of which go through `format.ts`. A masked value
becomes an `OpaqueAnnotation` whose `value` is the placeholder. The public union already
has that kind (`'<circular ref>'`, `'<function>'`), so the formatters, `summarize()` and
users' exhaustive switches need no change. That is what makes this feasible in 3.0 without
touching the public types at all.

Masking hides values, not keys. A masked composite keeps its shape and masks every leaf,
which is what keeps a nested error findable:

```ts
object({ creds: masked(object({ pin: number, hint: string })) });
// {
//   "creds": {
//     "pin": <masked>,
//            ^^^^^^^^ Must be number
//     "hint": <masked>,
//   },
// }
```

One `maskAnn(ann, placeholder)` helper does this: it rewrites every scalar and opaque leaf
to the placeholder, keeps the texts and the shape, and stays lazy (it wraps `getFields` /
`getItems`, never forces them). `masked(d)` applies it to `d`'s error, so `d` needs no
cooperation, which also covers `masked(define(...))`.

## Echo: masking the ancestors

The failing node is the easy part. The value also leaks from every ancestor that echoes
its input: above, `password` passed, and `object()` echoed it while reporting `username`.
In `array(login)`, a failing item 3 echoes items 0–2, passwords included. So a container
must annotate its input _through its children_, which means every decoder needs to know
how to echo a value at its position:

```ts
class DecoderImpl<T> {
  // decode, isReadonly, schema ...

  /** @internal How a value at this position is echoed in an error. `undefined`: as-is. */
  readonly echo: ((value: unknown, text?: string) => Annotation) | undefined;
}
```

- `undefined` for every decoder with nothing masked below it. Those containers keep
  calling `annotate()`/`annotateObject()` exactly as today, so their error text stays byte
  for byte.
- The `err()` that `make`/`define` hand an acceptance function annotates `blob` through
  `echo`. That one change covers `.refine`, `.reject`, `.describe` and every `err('...')`
  in the library.
- No decode-path cost. `echo` is read only when an error is built, and inside a container
  only when the lazy fields/items are first read, i.e. when the error is formatted.

The rule for deriving it: a container maps each child position to that child's echo.
Wherever a combinator can't map its input positions onto its children, and anything below
is masked, it masks everything. Over-masking costs some debuggability; under-masking costs
a secret.

| decoder                                          | `echo`, when something below is masked                         |
| ------------------------------------------------ | -------------------------------------------------------------- |
| `masked(d, p)`                                   | `maskAnn(annotate(v), p)`                                      |
| `object`, `exact`, `inexact(fields, rest?)`      | declared keys → field's echo; others → `rest`'s echo, or as-is |
| `array`, `nonEmptyArray`, `uniqueArray`          | each item → the item decoder's echo                            |
| `tuple`                                          | positional                                                     |
| `record(v)`, `record(k, v)`                      | each value → `v`'s echo (keys: see Open questions)             |
| `optional`, `nullable`, `nullish`                | `d`'s echo                                                     |
| `.refine`, `.reject`, `.describe`, `.refineType` | `this`'s echo                                                  |
| `.transform`, `.chain(fn)`, `.pipe(d)`           | `this`'s echo                                                  |
| `taggedUnion`                                    | the tag's branch's echo; unknown tag → mask all                |
| `either`                                         | mask all (see Open questions)                                  |
| `prep(fn, d)`                                    | mask all: `fn` is opaque                                       |
| `lazy(fn)`, `select(scout, fn)`                  | resolve at echo time, then delegate                            |

`lazy()` and `select()` can't know at construction whether anything below them is masked,
so they always carry a delegating `echo`. That's fine, because it only runs on the error
path, where resolving the factory is allowed, and delegating to a decoder with nothing
masked produces the same annotation `annotate()` would.

## Errors about the output

Echo describes the _input_ at a position. Some errors are about a decoder's _output_:
`.reject(fn)` annotates `result.value`, and `.pipe(next)` lets `next` annotate the
intermediate value, which `next` knows nothing about. `masked(string).pipe(regex(...))`
would echo the password raw.

Readonly settles it, the same way it settles `constrain` (Feature 3): a readonly decoder
hands back its input, so its output is echoed with its own `echo`. A non-readonly decoder
with something masked below it applies `maskAnn` to any error about its output, because
nothing says where the masked values ended up after a transform.

Error _texts_ are the one thing masking doesn't rewrite, and one source of them isn't
written by anyone: `.transform()` and `prep()` report a caught exception's `message`. V8's
`JSON.parse` quotes its input (`Unexpected token 'h', "hunter2" is not valid JSON`), so
`masked(string).transform(JSON.parse)` would leak through the text. Below a masked
position, a caught exception's message is therefore replaced by a fixed text. Messages the
user writes (`.refine(p, msg)`, a `.reject()` return value) stay theirs, and the docs say
not to interpolate the value into them.

## Required tests

- **The invariant, as a property test** (`fast-check`, like the schema soundness fuzzing).
  Generate decoders from every combinator above with `masked(...)` positions, generate
  inputs that put a sentinel string at those positions (and around them), and check the
  sentinel appears nowhere: `formatInline`, `formatShort`, `formatAsIssues`, and a full
  walk of the `Annotation`, with lazy fields forced.
- **Byte for byte:** every existing error-message test passes unchanged, since none of
  them has a masked position.
- The cases from `origin/masking`'s `test/masking.test.ts`, plus masked composites, masked
  items in arrays and records, `masked(d).transform(JSON.parse)`, and
  `masked(d).pipe(...)`.

# Collections: `uniqueArray`

`setFromArray` and `mapping` are removed. Each takes one specific input shape and returns
a different output shape (an array becomes a `Set`, an object becomes a `Map`), and
nothing in the name says which. They're also uncommon, and a one-liner in userland:

```ts
array(d).transform((xs) => new Set(xs)); // was: setFromArray(d)
record(d).transform((obj) => new Map(Object.entries(obj))); // was: mapping(d)
```

The migration guide and the historic docs entries show these recipes.

## `uniqueArray(d, { min, max })`

_Undecided: silently dedupe (described below) or reject duplicates? See Open questions._

The common reason to reach for `setFromArray` was deduplication, e.g. tags. `uniqueArray`
covers that without changing the output type:

```ts
uniqueArray(string); // ['a', 'b', 'a'] → ['a', 'b']
uniqueArray(string, { max: 10 }); // at most 10 _distinct_ tags
uniqueArray(string.transform(lower)); // dedupes case-insensitively
```

- Accepts any array `array(d)` accepts, and returns `T[]` with duplicates removed, keeping
  the first occurrence of each value, in input order.
- Duplicates are compared by `SameValueZero` (what `Set` uses) on the _decoded_ values,
  after `d` has run. That's what makes the `.transform(lower)` case work.
- `d` can be any decoder, but it's only really useful with primitive outputs: objects
  compare by reference, and decoded objects are usually fresh copies. No `key` option:
  deduping objects by a field is rare enough for a `.transform()`.
- `min`/`max`/`size` apply to the deduplicated output, not the input: under `{ max: 3 }`,
  `[1, 1, 1, 1, 2]` is accepted. This is the one place where the options mean something
  different from `array(d, { max })`, and the docs say so.
- Never readonly, because it drops items. Schema is `array(d)`'s, and bounds are not
  lifted into `minItems`/`maxItems` (the rule from `constrain`, and here it's also the
  correct answer, see Feature 3). No `uniqueItems` either, since duplicates are accepted.

# Propagation

Notation: `∅` = `UNREPRESENTABLE`; `RO(d)` = inherits from `d`; `all` = readonly iff every
child is.

| Export                                                                                                                                       | Readonly                     | `schema`                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------- |
| `string`, `boolean`, `anyNumber`, `number`, `integer`, `unknown`, `pojo`, `poja`                                                             | ✓                            | `type`                                                        |
| `regex`, `startsWith`, `endsWith`, `identifier`, `decimal`, `hexadecimal`, `nonEmptyString`                                                  | ✓                            | `string` + `pattern`                                          |
| `email`, `urlString`, `uuid*`, `isoDateString`                                                                                               | ✓                            | `string` + `format`                                           |
| `nonNegativeNumber`, `natural`                                                                                                               | ✓                            | `number`/`integer` + `minimum: 0`                             |
| `constant`, `oneOf`, `enum_`, `null_`                                                                                                        | ✓                            | `const` / `enum`                                              |
| `undefined_`                                                                                                                                 | ✓                            | `{ const: undefined }` (pruned by the walker; throws at root) |
| `never`, `fail`                                                                                                                              | ✓                            | `false`                                                       |
| `jsonYolo`                                                                                                                                   | ✓                            | `{}` (accepts anything; output type is asserted)              |
| `date`, `instanceOf`, `bigint`                                                                                                               | ✓                            | ∅                                                             |
| `array(d, o)`, `nonEmptyArray`, `record`, `tuple`, `either`, `taggedUnion`, `exact`, `inexact`, `optional`/`nullable`/`nullish` (no default) | all / RO(d)                  | composed                                                      |
| `object`                                                                                                                                     | ✗ (strips keys)              | composed, extra keys allowed                                  |
| `optional`/`nullable`/`nullish` with default                                                                                                 | ✗                            | `anyOf[undefined_ / null_ / both, d]` + `default`             |
| `always`, `truthy`, `numeric`, `isoDate`, `flexDate`, `url`, `httpsUrl`                                                                      | ✗                            | inherited / composed                                          |
| `uniqueArray(d, o)`                                                                                                                          | ✗ (drops duplicates)         | `array(d)`'s, bounds not lifted                               |
| `lazy(fn)` / `lazy(fn, { readonly: true })`                                                                                                  | ✗ / ✓ verified once          | `$defs` entry                                                 |
| `select(scout, fn)` / `..., { readonly: true }`                                                                                              | ✗ / ✓ verified per selection | ∅                                                             |
| `prep(fn, d)`                                                                                                                                | ✗                            | ∅ (the prep function is opaque)                               |
| `sized`, `min`, `max`, `between`                                                                                                             | RO(d)                        | keywords lifted iff readonly                                  |
| `define(fn, schema?)`                                                                                                                        | ✗                            | `schema`                                                      |
| `defineReadonly(guard, msg, schema?)`                                                                                                        | ✓                            | `schema`                                                      |
| `.refine`, `.reject`, `.describe`, `.refineType`                                                                                             | RO(this)                     | shared with parent                                            |
| `.transform`, `.chain(fn)`                                                                                                                   | ✗                            | inherited                                                     |
| `.pipe(d)`                                                                                                                                   | this ∧ d                     | `allOf[this, d]` if readonly, else `this`                     |
| `masked(d, placeholder?)`                                                                                                                    | RO(d)                        | shared with `d`                                               |

`taggedUnion` is implemented directly (`pojo.decode` + a `Map` from tag to child
`decode`), deriving its flag from its branches at construction, instead of today's
`object().transform()` scout that allocates a record per decode. See Feature 5.
`optional`/`nullable`/`nullish` get a direct fast path, one per variant, while keeping the
`anyOf` definition: `blob === undefined ? OK_UNDEFINED : d.decode(blob)` for `optional`,
`blob === null ? OK_NULL : d.decode(blob)` for `nullable`, and
`blob == null ? ok(blob) : d.decode(blob)` for `nullish` (loose, and it hands back
whichever of the two it got). This skips building a discarded `constant(undefined)`
rejection on every present value, which is cheap since lazy annotations but not free.

# Deprecations and removals

**Removed in 3.0.** Deprecated aliases from 2.x:

| Removed      | Use instead     |
| ------------ | --------------- |
| `dateString` | `isoDateString` |
| `iso8601`    | `isoDate`       |
| `datelike`   | `flexDate`      |

**Removed in 3.0, without deprecation.**

| Removed                      | Use instead                                                    |
| ---------------------------- | -------------------------------------------------------------- |
| `taggedUnion(key, { A, B })` | `taggedUnion(key, A, B)` (Feature 5)                           |
| `setFromArray(d)`            | `uniqueArray(d)`, or `array(d).transform((xs) => new Set(xs))` |
| `mapping(d)`                 | `record(d).transform((obj) => new Map(Object.entries(obj)))`   |

See Collections for why.

Removing a name from the library must not remove it from the docs. Links like
`decoders.cc/dateString` are out in the wild (READMEs, blog posts, Stack Overflow, old
error messages) and must keep redirecting to their modern equivalent. Today those
redirects are generated by `bin/update-decoder-redirects.js` from the `aliases` on each
`<DecoderSig>`, so deleting the alias from the MDX would silently turn the link into
a 404. Instead, each removed name stays in the docs as a _historic_ alias (e.g.
`removed: '3.0'` next to `deprecated: true`): rendered as "removed in 3.0" rather than
"deprecated", still indexed for search, and still emitted into `DECODER_REDIRECTS`. The
same applies to every future removal.

**Deprecated in 2.x, kept in 3.0.** Still deprecated, not removed yet:

| Deprecated        | Use instead         |
| ----------------- | ------------------- |
| `positiveNumber`  | `nonNegativeNumber` |
| `positiveInteger` | `natural`           |

**Deprecated in 3.0.** Kept as thin wrappers over the new forms (Feature 1):

| Deprecated                                | Use instead                                                 |
| ----------------------------------------- | ----------------------------------------------------------- |
| `min(n)`, `min(n, integer)`               | `number({ min: n })`, `integer({ min: n })`                 |
| `max(n)`, `max(n, integer)`               | `number({ max: n })`, `integer({ max: n })`                 |
| `between(a, b)`, `between(a, b, integer)` | `number({ min: a, max: b })`, `integer({ min: a, max: b })` |
| `min(n, natural)` & co.                   | `natural({ min: n })`, `nonNegativeNumber({ min: n })`      |

These go deprecated only once the callable `number`/`integer` ship, so there is always a
non-deprecated way to say the same thing.

**Not deprecated.**

- `nonNegativeNumber` and `natural` are the names 2.11 just introduced; they stay
  first-class. `number({ min: 0 })` is not a drop-in anyway: it accepts `-0`, which
  `nonNegativeNumber` rejects.
- `uuidv1`, `uuidv4` and `httpsUrl` stay as they are. They're too common to push behind a
  `uuid({ version })` or `url({ protocol })` option.
- `startsWith`/`endsWith` stay, and gain trailing `SizeOptions` (Feature 1).

# What breaks for 2.x users

Methods other than `decode` need `this` (`const { verify } = string` stops working;
`xs.map(d.decode)` keeps working). `typeof string === 'function'` for the callable set.
Readonly composites return their input by reference:
`exact`/`inexact`/`array`/`tuple`/`record`/`json` no longer copy, explicit-`undefined`
keys are retained. `.chain(decoder)` becomes `.pipe(decoder)` and `.pipe(fn)` becomes
`.chain(fn)`; each throws at construction when given the other kind. `isDecoder()`
recognizes the `v3` brand only, so it does not recognize decoders from a 2.x copy of the
library. `lazy()` memoizes. `~standard` gains `jsonSchema`. The deprecated 2.x aliases
listed under "Deprecations and removals" are removed. Regexes for
`identifier`/`hexadecimal`/`uuid*`/`nanoid` are rewritten flag-free so `pattern` can be
emitted verbatim. `Annotation` gains a union-failure member, so exhaustive `switch`es over
`annotation.type` need a new case. `Either:` error text may change, and input nested past
the `lazy()` depth limit rejects with `Too deeply nested` instead of throwing.
`taggedUnion(key, { A, B })` is removed in favor of `taggedUnion(key, A, B)`.
`setFromArray` and `mapping` are removed (see Collections for replacements). `masked()` is
additive: error text for decoders with no masked position below them is unchanged.

# Rollout

Seven phases, in the order of the sections above. Each is shippable on its own, and the
validation bar is the same for all three: run the repo's `tsd` with the propagation
assertions checked into `test-d/`, and diff every error message against
`test/objects.test.ts` and `test/core/standard-schema.test.ts` byte for byte.

1. **Callable atomics.** `callable()` + `init()`, `RangeOptions` in `options.ts`,
   `string`, the number decoders and the regex-backed string atomics recomposed
   constraint-first. `.chain()` starts throwing on a decoder, `.pipe()` on a function.
   Nothing else in the core moves.
2. **Readonly.** `defineReadonly`, the `isReadonly` field, `ReadonlyDecoder<T>` and its
   `this:`-parameter overloads, `decodeFields`, and the `{ readonly: true }` opt-in on
   `lazy()` and `select()`. Then the decoder modules in dependency order (`basics`,
   `strings`, `numbers`, `arrays`, `objects`, `collections`, `unions`, `dates`, `json`),
   each rewritten against `make`/`defineReadonly`. The callable atomics from phase 1
   become `ReadonlyDecoder` by changing their base, nothing else.
3. **Schema.** The `schema` field, `constrain`/`merge`, `sizeKeywords`/`rangeKeywords`
   (which is where phase 1's options objects pay off), then the walker, `toJSONSchema()`
   and `~standard.jsonSchema`. Last, because nothing before it depends on it, and the
   soundness fuzzing needs the whole library converted first.
4. **Deep input.** Independent of 1–3, so it can land anywhere in the sequence. It needs
   the lazy-annotations commit merged in from main. The union-failure annotation and
   render-at-format-time come first, and the `lazy()` depth guard goes in the same
   release, never before. Its validation bar is the error-message diff above, plus the
   deep-input tables in Feature 4 turning into fast rejections.
5. **`taggedUnion(key, ...branches)`.** Needs only the `schema` field from phase 3, not
   the walker, so it can land as soon as the modules carry their definitions. Validation:
   the required tests in Feature 5, plus a property test comparing `taggedUnion` against
   `either` over the same branches, on random inputs (including non-JSON values like
   `NaN`, `Date` and class instances), for identical results.
6. **Typed `prep()` input.** Independent of everything else, types only. `Prep<I, T>`, the
   conditional `prep()` signature, and the `.pipe()` overload, with the cases from Feature
   6 checked into `test-d/`. If Feature 2 has landed, the overload joins the `Like`/`Wrap`
   pipe overloads and always returns a plain `Decoder<V>`, since `prep()` is never
   readonly.
7. **Masking.** `maskAnn` and the internal `echo` field, the `err()` constructor and the
   `annotate()`/`annotateObject()` call sites in the modules switched over to it, then
   `masked()` itself. Independent of 3 and 5. Lands after 4, or together with it, so the
   union-failure annotation is designed not to carry a raw copy of the input. Validation:
   the leak property test in Feature 7, plus the byte-for-byte error-message diff for
   every decoder without a masked position.

**Final perf evaluation.** Once everything above has landed, re-measure against the latest
published 2.x and update the Performance numbers in `CHANGELOG.md`, which were last
measured against 2.12.1 for the brand change alone. Same method: install the published
version and this branch's `dist` side by side, run one script on the same Node, and
measure memory per decoder (`--expose-gc`, heap delta over 200k `define()` calls),
construction time, and `decode()` of an object decoder using `.refine`/`.transform`/
`.reject` in every field. Readonly (Feature 2) should move the decode number the most.

The `readonly` branch is a reference for tests and expected behaviour, not a merge source;
the callable-atomics WIP is `stash@{0}` on this branch and is superseded. The same goes
for `origin/masking`: its `OpaqueAnnotation` refactor is already on main, and its tests
(`test/masking.test.ts`) are a starting point, but its `kMask` field on the public
`Decoder` interface and `define(fn, { mask })` option are not the design here.

# Open questions

**Callable atomics**

- Deprecations to fold into the same major: `truthy`.
- `inexact(fields, rest)` types as `ObjectDecoderType<Ds> & Record<string, R>`, so a field
  whose type is not assignable to `R` collapses toward `never` on read. Reject that at the
  type level (constrain `Ds` to decoders of `R`), or type the rest part as "other keys"
  some other way?

**Branching**

`select(scout, pick)` is the only way to branch on something other than a tag value, and
Liveblocks hand-writes it at ~13 sites, one with the comment _"Decoders needs to offer
better built-in support for branching like this"_. Two shapes show up:

- **By runtime type**, to put a constraint on one branch only:

  ```ts
  select(
    either(string, boolean, number).describe('Must be string, number, or boolean'),
    (x) => (typeof x === 'string' ? sized(string, { max }) : either(boolean, number)),
  );
  ```

  Every type is checked twice (scout, then branch) and the message is hand-written. The
  goal is these errors, from the branch that matches the input's _type_ (implementation
  TBD, see the options below):

  ```ts
  const d = either(nonEmptyString, number);
  d.verify(null); // Must be string or number
  d.verify('  '); // Must be non-empty string
  d.verify(Infinity); // Number must be finite
  ```

  Today (2.x) all three print an `Either:` list of every branch's error, half of it
  irrelevant (`'  '` also reports "Must be number"). Undecided how to get there; two
  candidates so far:

  1. **Heuristic in the formatter.** With the union annotation from Feature 4, `either()`
     keeps branch errors as structure, so the formatter can pick: if exactly one branch
     accepts the input's type (its schema's `type`), show only that branch's error; if
     none does, show one merged "Must be …" line. Results never change, only error text,
     but it's still `either()` guessing, which is the kind of invisible magic
     ROADMAP-DECISIONS.md rejected for dispatch. Unclear cases: several branches accept
     the type (`either(string({ max: 5 }), email)`), and branches with no `type`
     (`prep()`, `select()`, `define()`).
  2. **Explicit, like `taggedUnion`.** A combinator keyed by runtime type, e.g.
     `byType({ string: nonEmptyString, number })`. The dispatch is in the code, each input
     is checked once, the "Must be string or number" message falls out of the keys, and
     `'  '` can only ever report the string branch's error. Costs a new name, and `either`
     keeps today's error text.

- **By key presence**, where there is no tag to dispatch on:
  ```ts
  select(object({ children: unknown }), ({ children }) =>
    children !== undefined ? elementNode : decoratorNode,
  );
  ```
  `taggedUnion` needs a tag value; here there's only a key that's there or not (up to
  4-way in `lexical.ts`). A real gap. Could `taggedUnion` learn to dispatch on "has key
  X", or is it a separate combinator? Could the branches' schemas (`required`) drive it,
  the same way tag sets are derived for `taggedUnion` (Feature 5)?

**Collections**

- `uniqueArray`: silently dedupe `['a', 'a']` → `['a']`, or reject it? Deduping is what
  tags want and needs no client cooperation, but it's never readonly, bounds apply to the
  output, and the schema can't say `uniqueItems`. Rejecting is readonly (when `d` is), so
  `uniqueItems`, `minItems` and `maxItems` all come out exact, and it matches Effect's
  `Schema.UniqueArray`, the only prior art (zod, arktype, valibot and yup have neither).
  Both could exist under two names; which one gets `uniqueArray`? Deferred: decide once
  everything else is implemented.

**Schema**

- Should `SchemaDef` be decoders' own schema tree rather than JSON Schema keywords with
  holes? A strict, exhaustively checkable node union would decouple the internal language
  from JSON Schema drafts entirely, and would let `date`, `instanceOf` and `bigint` keep a
  real node instead of collapsing to `UNREPRESENTABLE`, which today throws that
  information away — the same tree could then feed documentation generation, TS type
  emission, or form UIs, not just JSON Schema. Costs: a genuine AST-to-JSON-Schema
  compiler instead of a mostly-copying walker, and an escape hatch for `defineReadonly`
  callers who want keywords the union does not enumerate (`contentEncoding`, `x-*`).
- Bundle: ship the ~1 KB walker in core, or behind a `decoders/json-schema` entry that
  registers it? Everything else in this design costs a never-asked app nothing; this is
  the one remaining cost.
- Emit `pattern` instead of `format` wherever the decoder is regex-backed? The regex _is_
  the acceptance condition, so `decoder ⊆ pattern` holds by construction, which `format`
  does not: see the counterexamples under "What a first pass already found". `format` also
  has consumer-defined semantics (annotation-only unless the validator opts in), and a
  keyword whose meaning the consumer picks is one whose soundness cannot be asserted.
  Cost: an unreadable `pattern` in an LLM tool schema where `format: 'email'` reads
  nicely, and `format` may still be emitted alongside where it is provably a superset
  (`uuid` is).
- Should `isoDateString` reject invalid calendar dates in 3.0? Today
  `"2024-02-31T00:00:00Z"` decodes to Mar 2 with no error. Breaking, small, and it turns a
  `decoder-defect` LOSS into no disagreement at all — `format: 'date-time'` becomes sound
  _and_ tight. Same budget could require the RFC 3339 offset colon (`+02:00`, not
  `+0200`), which removes the `implementation-defined` row.
- An optional schema argument on the opaque combinators — `select(scout, fn, schema?)`,
  `prep(fn, d, schema?)` — mirroring `define(fn, schema?)`. The library would pass it for
  its own exports, so `flexDate`, `numeric`, `url` and friends stop being ∅. `flexDate` is
  the sharp case: it exists to bridge JSON payloads and `Date` instances, its JSON-facing
  behaviour is exactly `isoDateString` (the `date` branch is unreachable from JSON), and
  as written it is the single field that makes `toJSONSchema` throw on an otherwise
  ordinary object. This is the small version of the `SchemaDef`-as-AST question above;
  user-built `prep`/`select` would still land in ∅.
- Does ∅ widen to `{}` at emit time, or throw? `{}` is sound for everything, so widening
  is legal; throwing is a usability choice, not a soundness one. Suggested split: widen by
  default, `toJSONSchema(d, { onUnknown: 'throw' })` for the build-time signal, with
  arktype's `fallback: (ctx) => ctx.base` as the shape to copy. Orthogonal to the above:
  once ∅ means only "a user-supplied opaque function stands between the wire and the
  decoder", widening is far less lossy than it is today.

**Deep input**

- What does the rest of the union-failure annotation look like? Its tag is `'union'` (as
  in the migration guide); `{ type: 'union', branches, text? }` seems the obvious shape,
  but it's a public type, so it may be worth designing it alongside any other error-model
  changes in 3.0 (e.g. `define()`'s `Pending<T>`, if adopted; see below).
- Is `Too deeply nested` the right message for the `RangeError` backstop, given it will
  occasionally mislabel a user's own `RangeError` from a `.transform()`?
- `MAX_DEPTH`: 1000, or configurable per `lazy()` (e.g. `lazy(fn, { maxDepth })`) next to
  `{ readonly: true }`?
- Would a larger stack (`node --stack-size`) change the cascade timing enough to matter,
  or only move the thresholds?

**`taggedUnion`**

- Should a tag set from a user-supplied `define(fn, schema)` be trusted? It is a claim,
  and a wrong `const` there silently skips a branch that would have accepted. Options:
  trust it (it's documented as the decoder's acceptance), or trust only nodes the library
  built itself, recognizable by identity or a private symbol.
- `taggedUnion` checks its branches when it's built, but a `lazy()` branch can't be
  inspected until its factory has run. Should a `lazy` branch be rejected, deferred to the
  first decode (where throwing breaks `.decode()`'s never-throws contract), or trusted and
  checked in a test?
- Emit OpenAPI's `discriminator` keyword from the walker for `taggedUnion`? It is
  OpenAPI-only (not JSON Schema) and string-tags-only, so probably not by default.

**Typed `prep()` input**

- Name: `Prep<I, T>`, `PrepDecoder<I, T>`, or something like `LimitedDecoder<I, T>` that
  says what it can't do? It shows up in hovers, so it's public either way.
- How much of the `Decoder` surface should `Prep` carry? `describe` is the one the
  motivating example needs. `refine`/`reject`/`transform` are easy to add, but each one is
  another method that has to return `Prep` and not `Decoder`, and all of them can be
  written after the `.pipe()` instead.
- Should `select()` get the same treatment? Its scout function has the same `unknown`
  problem when it sits behind a `.pipe()`.

**Masking**

- Name: `masked(d)` (from `origin/masking`, reads like `optional(d)`/`trimmed`),
  `sensitive(d)`, `redacted(d)`, or a `.mask()` method? A free function needs no
  `this:`-overloads beyond the readonly pair every combinator already has.
- Default placeholder: `<masked>`, `***`, or something else? It's printed verbatim, so it
  should not look like valid JSON.
- `either` with a masked branch, as a child of a failing container: mask the whole value
  (proposed: simple, always safe), or re-run the branches at echo time and use the first
  accepting branch's echo (exact, since that is the branch `either` picked)?
- Keys: `record(masked(string), v)` and `inexact(fields, masked(rest))`. Masking keys
  means placeholder field names, which collide in an `ObjectAnnotation`'s `Map`. Throw at
  construction for a masked key decoder, or allow it and mask only the values? Either way
  `Unexpected extra keys: 'x'` and `Invalid key 'x'` still quote input keys.
- The fixed text that replaces a caught exception's message below a masked position:
  something generic (`Invalid value`), or the exception's class name (`SyntaxError`)?
- Should `masked(d)`'s schema say anything? JSON Schema's `writeOnly: true` and OpenAPI's
  `format: 'password'` are both annotation keywords, so emitting them can't cause a LOSS.
  Probably not by default: neither means "don't echo this", and a form generator reading
  `format: 'password'` is the only consumer that would act on it.
- Feature 4's union-failure annotation: its shape should not carry a raw copy of the input
  next to the branch annotations, or `either` would bypass `echo`. Design both together.

**`define()`'s `err()` returns `Pending<T>`?**

Undecided; not in the migration guide until it is. The idea: `err('msg')` inside a
`define()` acceptance function returns an opaque `Pending<T>` marker instead of a full
`DecodeResult<T>`, and `decode()` attaches the annotation (with `blob`) when the function
returns.

```ts
define((blob, ok, err) => (isBuffer(blob) ? ok(blob) : err('Must be a buffer'))); // unchanged

define((blob, ok, err) => {
  const r = err('Must be a buffer');
  r.error; // ❌ no longer possible: `r` is a Pending<T>, not a DecodeResult<T>
  return r;
});
```

- **Why (presumed, not measured):** today every `decode()` call allocates a fresh
  `makeFlexErr` closure that captures `blob` (`src/core/Decoder.ts`), even when decoding
  succeeds. With `Pending<T>`, `err` can be one shared function, like `ok` already is.
- **Cost:** a breaking change to the custom-decoder API, and an unusual contract ("must
  return, may not inspect") that's hard to explain in docs. Few users should be affected,
  since inspecting the result of `err()` is rare.
- **Before deciding:** benchmark whether the closure actually shows up on the success path
  (V8 may already optimize it away), and whether the win survives once Feature 2 makes
  readonly composites skip most of the per-decode work anyway.
- **Alternative:** keep today's closure. It can't be avoided without changing what `err()`
  returns, since capturing `blob` is its whole job.
