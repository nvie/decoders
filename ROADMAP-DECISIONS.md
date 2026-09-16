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
   `interface StringDecoder extends ReadonlyDecoder<string> { (options: SizeOptions): ReadonlyDecoder<string> }`
   is expressible only as an interface. Callable atomics are impossible otherwise.
3. **Internals would leak.** `schema` and `isReadonly` live on the implementation.
   Publishing the class publishes them — in hovers, in `.d.ts`, in every user's
   autocomplete.
4. **`ReadonlyDecoder<T>` is interface composition.** Narrowing `isReadonly` to `true` by
   extension, and resolving `Like<this, U>` through polymorphic `this`, both want an
   interface.

## `Like<this, X>`, not a bare `this` return

`Like<this, X>` rather than a bare `this` return is what keeps the callable atomics
honest: with `this`, `string.refine(p, msg)` would type as `StringDecoder`, i.e. still
callable, and `string.refine(p, 'x')({ max: 5 })` would compile and then crash, because
`refine` hands back a plain decoder. `Like` erases the call signature and keeps only the
readonly-ness.

## Nothing re-declared on `ReadonlyDecoder<T>`

A sub-interface may safely re-declare `reject`, `describe`, and even the full `refine`
overload pair, but `refineType<S extends T>(): ReadonlyDecoder<S>` breaks assignability to
`Decoder<unknown>`. It takes no parameters, so there is nothing to infer from and TS has
to relate the constraints directly (`string` against `unknown`). `ReadonlyDecoder<T>`
therefore narrows `isReadonly` and re-declares nothing; the readonly-ness of method
results comes from `Like<this, X>` on `Decoder<T>` itself.

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

`min`/`max` are inclusive, `gt`/`lt` exclusive, at most one per side. Exclusive bounds are
there for floats (`number({ gt: 0 })`), and map onto
`exclusiveMinimum`/`exclusiveMaximum`. No `gte`/`lte` aliases: two spellings for one bound
means more invalid combinations to forbid (`{ min, gte }`), and `min`/`max` already mean
"inclusive" in `SizeOptions`. No `size`: an exact number is `constant(n)`.

## Every number decoder is callable, except `anyNumber`

`number`, `integer`, `natural` and `nonNegativeNumber` all take `RangeOptions`, so
`min`/`max`/`between` have a replacement for every built-in decoder they were combined
with. Not `anyNumber`: `NaN` compares false against every bound, so
`anyNumber({ min: 0 })` would accept `NaN`. With a custom decoder, use `.reject()`.

## `ranged()` is private

It is `between()` with an options object. Exporting it would bring back the function
Feature 1 deprecates. The public spelling is `number({ ... })`/`integer({ ... })`.
