# Migrating to v2

Decoders v2 has been rewritten to be simpler,
[smaller](./docs/assets/size-comparison@2x.png), and more efficient. Conceptually, it
still works the same way as v1, but some of the APIs have been rewritten in a backward
incompatible manner. As such, you may have to make some code changes to migrate to v2.

Please go over this checklist to perform the migration. If you run into issues that aren't
somehow covered by this migration guide, please
[open an issue](https://github.com/nvie/decoders/issues/new?assignees=nvie&labels=question&template=need-help-migrating-to-2-x.md&title=Migration+help+needed)
for this, and I'm happy to help 🙏 !

## 🏁 Checklist

1. Install `$ npm install decoders`
1. If applicable, uninstall debrief: `$ npm uninstall debrief`
1. If applicable, uninstall lemons: `$ npm uninstall lemons`
1. Stop "calling" decoders, see [instructions](#stop-calling-decoders).
1. Rewrite patterns imports for decoders that have been renamed, see
   [instructions](#rename-some-decoders).
1. Rewrite all uses of `guard()`, see [instructions](#guards-are-no-longer-a-thing).
1. If applicable, see
   [migration instructions below](#rewriting-imports-from-lemons-or-debrief) for how to
   rewrite imports from those libraries.
1. ![](./docs/assets/tiny-flow-logo.png) **Flow users only:** Rewrite use of
   `$DecoderType`, see [instructions](#rewrite-use-of-decodertype).

## Stop "calling" decoders

Decoders in 1.x where functions. In 2.x they're more like classes.

```typescript
// ❌ 1.x
const result = mydecoder(externalData);

// ✅ 2.x
const result = mydecoder.decode(externalData);
//                       ^^^^^^
```

## Rename some decoders

Some decoders have been renamed. See the table below. You can do a simple "search &
replace" command for these:

| Replace this v1 pattern...           |     | ...with this v2 API                        | Notes                                                                        |
| :----------------------------------- | --- | :----------------------------------------- | :--------------------------------------------------------------------------- |
| `map(mydecoder, ...)`                | →   | `mydecoder.transform(...)`                 | [migration instructions](./MIGRATING-v2.md#map-is-now-transform)             |
| `compose(mydecoder, predicate(...))` | →   | `mydecoder.refine(...)`                    | [migration instructions](./MIGRATING-v2.md#compose--predicate-is-now-refine) |
| `describe(mydecoder, ...)`           | →   | `mydecoder.describe(...)`                  |                                                                              |
| `either`, `either3`, ..., `either9`  | →   | `either`                                   |                                                                              |
| `tuple1`, `tuple2`, ... `tuple6`     | →   | `tuple`                                    |                                                                              |
| `dispatch`                           | →   | `taggedUnion`                              |                                                                              |
| `url(...)`                           | →   | `httpsUrl` / `url` (signature has changed) | [migration instructions](./MIGRATING-v2.md#signature-of-url-has-changed)     |

## `map()` is now `.transform()`

The `map()` decoder has been renamed to the
[`.transform`](https://decoders.cc/.transform) decoder method:

```typescript
// ❌ 1.x
import { string } from 'decoders';
const uppercase = map(string, (s) => s.toUpperCase());

// ✅ 2.x
const uppercase = string.transform((s) => s.toUpperCase());
```

## `compose()` + `predicate()` is now `.refine()`

The `compose()` and `predicate()` decoders from v1 where mostly used in tandem and used to
add additional checks to existing decoders. Predicates have been moved to the
[`.refine()`](https://decoders.cc/.refine) decoder method:

```typescript
// ❌ 1.x
import { compose, number, predicate } from 'decoders';
const odd = compose(
  number,
  predicate((n) => n % 2 !== 0, 'Must be odd'),
);

// ✅ 2.x
const odd = number.refine((n) => n % 2 !== 0, 'Must be odd');
```

## Guards are no longer a thing

The concept of "guards" has been removed entirely. The following APIs have been removed:

- The function `guard()`
- The type `Guard<T>`
- The helper type `GuardType<T>`

Instead, all decoders now have a [`.verify()`](https://decoders.cc/.verify)
method which does the exact same thing.

```ts
// ❌ 1.x
import { guard, Guard } from 'decoders';

const verify: Guard<Whatever> = guard(whatever);
const value: Whatever = verify(externalData);

// ✅ 2.x
const value: Whatever = whatever.verify(externalData);
```

## Signature of `url` has changed

The signature of the old `url` decoder has changed. Compare
[old](https://github.com/nvie/decoders/blob/v1.25.5/src/string.js#L55-L66) vs
[new](https://decoders.cc/url).

1. `url()` is no longer a function taking a list of schemes.
2. `url` now returns a `URL` instance, no longer a string.
3. There's no direct way for decoding custom schemas anymore, but you can
   [reimplement the old decoder yourself](https://gist.github.com/nvie/9e912992102b44b5c843c26ee3b19450).
   This is also a great way to enforce other rules, like specific domains, etc.

| Replace this v1 pattern... |     | ...with this v2 API                                                                        |
| :------------------------- | --- | :----------------------------------------------------------------------------------------- |
| `url()`                    | →   | [`httpsUrl`](https://decoders.cc/httpsUrl)                                        |
| `url([])`                  | →   | [`url`](https://decoders.cc/url)                                                  |
| `url(['git'])`             | →   | Define manually ([example](https://gist.github.com/nvie/9e912992102b44b5c843c26ee3b19450)) |

## Rewriting imports from `lemons` or `debrief`

This section only applies **if you used the `lemons` or `debrief` library directly** to
build custom decoders. If not, just ignore this section.

Decoders used to depend on external libraries `lemons` and `debrief`, but this is no
longer the case in v2. You no longer have to create `Ok`/`Err` results manually when
defining your own decoders, nor deal with annotating inputs manually.

Take this example decoder, which defines a `Buffer` decoder:

```typescript
// ❌ 1.x
import { Err, Ok } from 'lemons/Result';
import { annotate } from 'debrief';
import { Decoder } from 'decoders';

export const buffer: Decoder<Buffer> = (blob) =>
  Buffer.isBuffer(blob) ? Ok(blob) : Err(annotate(blob, 'Must be Buffer'));
```

In 2.x the `ok` and `err` helpers get passed to you by
[`.define()`](https://decoders.cc/define), so you no longer have to import them
yourself. Also, notice how you no longer have to manually annotate the blob in simple
cases like this. You can simply return a string `err` message directly.

```typescript
// ✅ 2.x
import { define } from 'decoders';

export const buffer: Decoder<Buffer> = define((blob, ok, err) =>
  Buffer.isBuffer(blob) ? ok(blob) : err('Must be Buffer'),
);
```

### If you are accessing `Result` instances directly

The `Result<T>` type is no longer a class, but a very
[simple data structure](https://github.com/nvie/decoders/blob/main/src/types/result.d.ts#L1-L13).
This plays well with TypeScript as well as helps to tree-shake many unused methods from
your bundle.

As such, methods previously available on Result instances no longer exist. Direct access
of the `ok`, `value`, and `error` properties are now favored.

Suggested changes:

```typescript
import { err, ok } from 'decoders';
```

| Replace this v1 pattern... |     | ...with this v2 API                             |
| :------------------------- | :-- | :---------------------------------------------- |
| `result.andThen(f)`        | →   | `result.ok ? f(result.value) : result`          |
| `result.dispatch(f, g)`    | →   | `result.ok ? f(result.value) : g(result.error)` |
| `result.errValue()`        | →   | `result.error`                                  |
| `result.expect()`          | →   | _removed_                                       |
| `result.isErr()`           | →   | `!result.ok`                                    |
| `result.isOk()`            | →   | `result.ok`                                     |
| `result.map(f)`            | →   | `result.ok ? ok(f(result.value)) : result`      |
| `result.mapError(g)`       | →   | `result.ok ? result : err(g(result.error))`     |
| `result.toString()`        | →   | _removed_                                       |
| `result.unwrap()`          | →   | _removed_ (see below)                           |
| `result.value() ?? xxx`    | →   | `decoder.value(...) ?? xxx`                     |
| `result.value() \|\| xxx`  | →   | `decoder.value(...) \|\| xxx`                   |
| `result.withDefault(xxx)`  | →   | `decoder.value(...) ?? xxx`                     |

If you're using `result.unwrap()` it's probably because you're using it like so:

```ts
// ❌ 1.x
const result = mydecoder(externalData);
result.unwrap(); // Might throw
```

You will likely no longer need it, now that the decoder method
[`.verify()`](https://decoders.cc/api/Decoder#verify) exists.

```ts
// ✅ 2.x
mydecoder.verify(externalData); // Might throw
```

## Rewrite use of `$DecoderType`

> _![](./docs/assets/tiny-flow-logo.png) **Flow users only!** The helper type
> `$DecoderType` has now been simplified. The `$`-sign has been removed from the name, and
> you no longer have to `$Call<>` it._

> _![](./docs/assets/tiny-ts-logo.png) For **TypeScript users** no changes are needed._

```js
const mydecoder = array(whatever);

// ❌
type X = $Call<$DecoderType, typeof mydecoder>; // Array<Whatever>

// ✅
type X = DecoderType<typeof mydecoder>; // Array<Whatever>
```
