---
title: positiveInteger
description: Numbers decoder
---

# `positiveInteger` decoder

```typescript
positiveInteger(): Decoder<number>
```

[View source](https://github.com/nvie/decoders/tree/main/src/numbers.ts#L41-L47)

Accepts only non-negative (zero or positive) finite whole numbers.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="positiveInteger" />

## Code Examples

```typescript
// 👍
      positiveInteger.verify(123) === 123;
      positiveInteger.verify(0) === 0;

      // 👎
      positiveInteger.verify(-3);              // throws
      positiveInteger.verify(3.14);            // throws
      positiveInteger.verify(Infinity);        // throws
      positiveInteger.verify(NaN);             // throws
      positiveInteger.verify('not a number');  // throws
      positiveInteger.verify(-0);              // throws
```

