# Decoders 3.x: settled decisions

Rationale behind decisions in [ROADMAP.md](./ROADMAP.md) that are settled and no longer up
for discussion. Kept for reference (and for agents working on the code), not for reading
front to back.

## `Decoder<T>` stays an interface

Four independent reasons, any one of which is sufficient:

1. **Not every decoder is an instance.** A callable atomic is an arrow function with a
   swapped prototype, never `new DecoderImpl()`. The interface is the contract; the class
   is one way to satisfy it, and `callable()` is another.
2. **A class cannot have a call signature.**
   `interface ReadonlyCallableDecoder<T, O> extends ReadonlyDecoder<T> { (options: O): ReadonlyDecoder<T> }`
   is expressible only as an interface. Callable atomics are impossible otherwise.
3. **Internals would leak.** `schema` and `isReadonly` live on the implementation.
   Publishing the class publishes them — in hovers, in `.d.ts`, in every user's
   autocomplete.
4. **`ReadonlyDecoder<T>` is interface composition.** Narrowing `isReadonly` to `true` by
   extension, and picking an overload by the type of `this`, both want an interface.

## `this:`-parameter overloads, not `Like<this, X>`

A readonly-preserving method has two overloads on `Decoder<T>`, picked by the type of the
receiver:

```ts
reject(this: ReadonlyDecoder<T>, f: RejectFn<T>): ReadonlyDecoder<T>;
reject(f: RejectFn<T>): Decoder<T>;
```

A bare `this` return was never an option: `string.refine(p, msg)` would type as a callable
decoder, so `string.refine(p, 'x')({ max: 5 })` would compile and then crash, because
`refine` hands back a plain decoder. The overloads return plain `ReadonlyDecoder<T>` or
`Decoder<T>`, which erases the call signature.

A conditional `Like<this, X>` return type was the original design, but TS can't resolve it
inside the implementing class, so every method would need a cast, and `Like` (plus `Wrap`
for the free-function combinators) would have to be exported, since it shows up in
inferred types. The overloads need neither.

The cost: inside a generic helper, the overload is picked before the receiver is known, so
readonly-ness is lost
(`function f<D extends Decoder<string>>(d: D) { return d.refine(...) }` returns
`Decoder<string>`). That's accepted: a helper that takes a decoder can't promise readonly
anyway, since it may just as well call `.transform()`.

Free-function combinators follow the same pattern, with a readonly overload first:
`array(d: ReadonlyDecoder<T>): ReadonlyDecoder<T[]>`, then
`array(d: Decoder<T>): Decoder<T[]>`. Internally they're built with
`make(fn, isReadonly)`, which derives the flag from the children at construction.

## Nothing re-declared on `ReadonlyDecoder<T>`

A sub-interface may safely re-declare `reject`, `describe`, and even the full `refine`
overload pair, but `refineType<S extends T>(): ReadonlyDecoder<S>` breaks assignability to
`Decoder<unknown>`. It takes no parameters, so there is nothing to infer from and TS has
to relate the constraints directly (`string` against `unknown`). `ReadonlyDecoder<T>`
therefore narrows `isReadonly` and re-declares nothing; the readonly-ness of method
results comes from the `this:` overloads on `Decoder<T>` itself.

## Two callable types

Most callable atomics are readonly (`string`, `number`, `hexadecimal`, …), but `trimmed`
and `numeric` transform their input. So there are two interfaces, both exported:
`ReadonlyCallableDecoder<T, O>` (extends `ReadonlyDecoder<T>`, and calling it returns one)
and `CallableDecoder<T, O>` (extends `Decoder<T>`).

## A readonly `lazy()` or `select()` that resolves to a non-readonly decoder throws

`lazy(fn, { readonly: true })` and `select(scout, fn, { readonly: true })` require `fn` to
return a `ReadonlyDecoder` at the type level, so a mismatch only happens through casts or
`any`. At runtime it throws a setup error when the decoder resolves: on the first decode
for `lazy()` (it's memoized), on each selection for `select()`. It's a programmer error,
like `.chain(decoder)` throwing, so it's not reported as a decode error, even though it
means `.decode()` can throw in this one misuse case.

## Readonly `exact()`/`inexact()` keep the input's shape

Handing back the input means explicitly `undefined` keys are kept, and keys keep the
input's order instead of the definition's. Both are inherent to not copying. `object()`,
which always copies, keeps the normalized shape.

## `either()` does not dispatch

`either()` tries its branches in order, in 3.x too. `taggedUnion(key, ...branches)` is the
only union that dispatches, and it always picks exactly one branch: it throws at
construction if a branch doesn't pin its tag, or if two branches accept the same tag.

Letting `either()` infer a discriminator from its branches' schemas was considered and
rejected. Results would never change, but speed and error quality would depend on
something invisible in the code:

- a branch wrapped in `prep()`, or a typo in a key name, silently turns that branch into a
  wildcard that's tried for every tag;
- two branches accidentally accepting the same tag silently lengthen that tag's candidate
  list;
- inferring the key can pick the wrong one, e.g. a shared `version: constant(1)` field
  that every branch has, which then dispatches nothing.

None of these produce an error or a warning. No magic is easier to explain and has no
tripwires: `either()` is always the loop, and when you want dispatch you name the key.

## No `set(d)` or `map(k, v)`

Real `Set`/`Map` inputs never arrive over the wire, so these would rarely be used. Giving
them decoder-quality error messages (the input echoed back with the bad member marked)
needs `set` and `map` members in the public `Annotation` union, and their formatting code
in core, which every app bundles. Not worth it for decoders almost nobody needs.
`array(d).transform((xs) => new Set(xs))` covers the common case.

## `RangeOptions` is `{ min, max, gt, lt }`

`min`/`max` are inclusive, `gt`/`lt` exclusive. Exclusive bounds are there for floats
(`number({ gt: 0 })`), and map onto `exclusiveMinimum`/`exclusiveMaximum`. No `gte`/`lte`
aliases: two spellings for one bound is one too many, and `min`/`max` already mean
"inclusive" in `SizeOptions`. No `size`: an exact number is `constant(n)`.

The type is four optional fields, not a union that forbids `{}` or `{ min, gt }`: that
union made every hover unreadable, to rule out combinations that are harmless (`{}` adds
no bounds) or contrived (with both bounds on one side, `min`/`max` win).

## Every number decoder is callable, except `anyNumber`

`number`, `integer`, `natural` and `nonNegativeNumber` all take `RangeOptions`, so
`min`/`max`/`between` have a replacement for every built-in decoder they were combined
with. Not `anyNumber`: `NaN` compares false against every bound, so
`anyNumber({ min: 0 })` would accept `NaN`. With a custom decoder, use `.reject()`.

## `ranged()` is private

It is `between()` with an options object. Exporting it would bring back the function
Feature 1 deprecates. The public spelling is `number({ ... })`/`integer({ ... })`.
