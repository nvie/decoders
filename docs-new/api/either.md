---
title: either
description: Unions decoder
---

# `either` decoder

```typescript
either<A, B, ...>(Decoder<A>, Decoder<B>, ...): Decoder<A | B | ...>
```

[View source](https://github.com/nvie/decoders/tree/main/src/unions.ts#L50-L83)

Accepts values accepted by any of the given decoders.

The decoders are tried on the input one by one, in the given order. The
first one that accepts the input "wins". If all decoders reject the input,
the input gets rejected.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="either(string, number)" />

## Code Examples

```typescript
const decoder = either(number, string);

      // 👍
      decoder.verify('hello world') === 'hello world';
      decoder.verify(123) === 123;

      // 👎
      decoder.verify(false);  // throws
```

