---
title: boolean
description: Booleans decoder
---

# `boolean` decoder

```typescript
boolean(): Decoder<boolean>
```

[View source](https://github.com/nvie/decoders/tree/main/src/booleans.ts#L4-L9)

Accepts and returns booleans.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="boolean" />

## Code Examples

```typescript
// 👍
      boolean.verify(false) === false;
      boolean.verify(true) === true;

      // 👎
      boolean.verify(undefined);      // throws
      boolean.verify('hello world');  // throws
      boolean.verify(123);            // throws
```

