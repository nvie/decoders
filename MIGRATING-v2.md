# Migrating to v2

Decoders v2 has been rewritten to be simpler, smaller, and more efficient. Conceptually,
it still works the same way as v1, but some of the APIs have been rewritten in a backward
incompatible manner. As such, you may have to make some code changes to migrate to v2.

Please go over this checklist to perform the migration.

## 🏁 Checklist

1. Install `$ npm install decoders@beta`
1. If applicable, uninstall debrief: `$ npm uninstall debrief`
1. If applicable, uninstall lemons: `$ npm uninstall lemons`
1. Stop "calling" decoders, see [instructions](#stop-calling-decoders).
1. Rename imports for decoders that have been renamed, see
   [instructions](#rename-some-decoders).
1. Rewrite all uses of `guard()`, see [instructions](#guards-are-no-longer-a-thing).
1. If applicable, see
   [migration instructions below](#rewriting-imports-from-lemons-or-debrief) for how to
   rewrite imports from those libraries.
1. [Flow only] Rewrite use of `$DecoderType`, see
   [instructions](#rewrite-use-of-decodertype).

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

| Replace... (v1)                                          |     | with... (v2) ✨                                                                           | Notes   |
| :------------------------------------------------------- | --- | :---------------------------------------------------------------------------------------- | ------- |
| `eitherN`<br /><small>`either3`, `either4`, etc.</small> | →   | [`either`](https://decoders.cc/api.html#either)                                           |         |
| `tupleN`<br /><small>`tuple1`, `tuple2`, etc.</small>    | →   | [`tuple`](https://decoders.cc/api.html#tuple)                                             |         |
| `dispatch`                                               | →   | [`taggedUnion`](https://decoders.cc/api.html#taggedUnion)                                 |         |
| `map(YOUR_DECODER, YOUR_FUNC)`                           | →   | `YOUR_DECODER`[`.transform`](https://decoders.cc/Decoder.html#transform)`(YOUR_FUNC)`     |         |
| `compose(YOUR_DECODER, predicate(YOUR_FUNC, YOUR_MSG))`  | →   | `YOUR_DECODER`[`.refine`](https://decoders.cc/Decoder.html#refine)`(YOUR_FUNC, YOUR_MSG)` |         |
| `url()`                                                  | →   | [`httpsUrl`](https://decoders.cc/api.html#httpsUrl)                                       | See (1) |
| `url([])`                                                | →   | [`url`](https://decoders.cc/api.html#url)                                                 | See (2) |
| `url(['git'])`                                           | →   | —                                                                                         | See (3) |

Some notes/comments:

1. `url()` is no longer a function taking a list of schemes.
2. `url` now returns a `URL` instance, no longer a string.
3. There's no direct way for decoding custom schemas anymore, but you can
   [reimplement the old decoder yourself](https://gist.github.com/nvie/9e912992102b44b5c843c26ee3b19450).
   This is also a great way to enforce other rules, like specific domains, etc.

## Guards are no longer a thing

The concept of "guards" has been removed entirely. The following APIs have been removed:

-   The function `guard()`
-   The type `Guard<T>`
-   The helper type `GuardType<T>`

Instead, all decoders now have a [`.verify()`](https://decoders.cc/Decoder.html#verify)
method which does the exact same thing.

```ts
// ❌ 1.x
import { guard, Guard } from 'decoders';

const verify: Guard<Whatever> = guard(whatever);
const value: Whatever = verify(externalData);

// ✅ 2.x
const value: Whatever = whatever.verify(externalData);
```

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
[`.define()`](https://decoders.cc/api.html#define), so you no longer have to import them
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
import { err, ok } from 'decoders/result';
```

| Replace usage of          | With ✨                                         |
| ------------------------- | ----------------------------------------------- |
| `result.andThen(f)`       | `result.ok ? f(result.value) : result`          |
| `result.dispatch(f, g)`   | `result.ok ? f(result.value) : g(result.error)` |
| `result.errValue()`       | `result.error`                                  |
| `result.expect()`         | _removed_                                       |
| `result.isErr()`          | `!result.ok`                                    |
| `result.isOk()`           | `result.ok`                                     |
| `result.map(f)`           | `result.ok ? ok(f(result.value)) : result`      |
| `result.mapError(g)`      | `result.ok ? result : err(g(result.error))`     |
| `result.toString()`       | _removed_                                       |
| `result.unwrap()`         | _removed_ (see below)                           |
| `result.value() ?? xxx`   | `result.value ?? xxx`                           |
| `result.value() \|\| xxx` | `result.value \|\| xxx`                         |
| `result.withDefault(xxx)` | `result.value ?? xxx`                           |

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

⚠️ **Flow users only!** The helper type `$DecoderType` has now been simplified. The
`$`-sign has been removed from the name, and you no longer have to `$Call<>` it.

```js
const mydecoder = array(whatever);

// ❌
type X = $Call<$DecoderType, typeof mydecoder>; // Array<Whatever>

// ✅
type X = DecoderType<typeof mydecoder>; // Array<Whatever>
```

(In TypeScript, this already worked this way.)
