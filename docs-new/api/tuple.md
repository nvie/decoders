---
title: tuple
description: Arrays decoder
---

# `tuple` decoder

```typescript
tuple<A, B, ...>(Decoder<A>, Decoder<B>, ...): Decoder<[A, B, ...]>
```

[View source](https://github.com/nvie/decoders/tree/main/src/arrays.ts#L66-L96)

Accepts a tuple (an array with exactly _n_ items) of values accepted by the
_n_ given decoders.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="tuple(string, number)" />

## Code Examples

```typescript
const decoder = tuple(string, number);

      // 👍
      decoder.verify(['hello', 1.2]) === ['hello', 1.2];

      // 👎
      decoder.verify([]);                  // throws, too few items
      decoder.verify(['hello', 'world']);  // throws, not the right types
      decoder.verify(['a', 1, 'c']);       // throws, too many items
```

