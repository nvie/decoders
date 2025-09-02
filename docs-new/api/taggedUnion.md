---
title: taggedUnion
description: Unions decoder
---

# `taggedUnion` decoder

```typescript
taggedUnion<A, B, ...>(field: string, mapping: { value1: Decoder<A>, value2: Decoder<B>, ... }): Decoder<A | B | ...>
```

[View source](https://github.com/nvie/decoders/tree/main/src/unions.ts#L122-L163)

If you are decoding tagged unions you may want to use the `taggedUnion()`
decoder instead of the general purpose `either()` decoder to get better
error messages and better performance.

This decoder is optimized for [tagged
unions](https://en.wikipedia.org/wiki/Tagged_union), i.e. a union of
objects where one field is used as the discriminator.

```ts
const A = object({ tag: constant('A'), foo: string });
const B = object({ tag: constant('B'), bar: number });

const AorB = taggedUnion('tag', { A, B });
//                        ^^^
```

Decoding now works in two steps:

1. Look at the `'tag'` field in the incoming object (this is the field
   that decides which decoder will be used)
2. If the value is `'A'`, then decoder `A` will be used. If it's `'B'`, then
   decoder `B` will be used. Otherwise, this will fail.

This is effectively equivalent to `either(A, B)`, but will provide better
error messages and is more performant at runtime because it doesn't have to
try all decoders one by one.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="taggedUnion("type", { user: object({ name: string }), admin: object({ permissions: array(string) }) })" />

