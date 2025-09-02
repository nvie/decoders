---
title: poja
description: Arrays decoder
---

# `poja` decoder

```typescript
poja(): Decoder<unknown[]>
```

[View source](https://github.com/nvie/decoders/tree/main/src/arrays.ts#L4-L14)

Accepts any array, but doesn't validate its items further.

"poja" means "plain old JavaScript array", a play on `pojo()`.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="poja" />

## Code Examples

```typescript
// 👍
      poja.verify([1, 'hi', true]) === [1, 'hi', true];
      poja.verify(['hello', 'world']) === ['hello', 'world'];
      poja.verify([]) === [];

      // 👎
      poja.verify({});    // throws
      poja.verify('hi');  // throws
```

