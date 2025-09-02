---
title: integer
description: Numbers decoder
---

# `integer` decoder

```typescript
integer(): Decoder<number>
```

[View source](https://github.com/nvie/decoders/tree/main/src/numbers.ts#L25-L31)

Accepts only finite whole numbers.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="integer" />

## Code Examples

```typescript
// 👍
      integer.verify(123) === 123;

      // 👎
      integer.verify(-3.14);           // throws
      integer.verify(Infinity);        // throws
      integer.verify(NaN);             // throws
      integer.verify('not a integer'); // throws
```

