---
title: positiveNumber
description: Numbers decoder
---

# `positiveNumber` decoder

```typescript
positiveNumber(): Decoder<number>
```

[View source](https://github.com/nvie/decoders/tree/main/src/numbers.ts#L33-L39)

Accepts only non-negative (zero or positive) finite numbers.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="positiveNumber" />

## Code Examples

```typescript
// 👍
      positiveNumber.verify(123) === 123;
      positiveNumber.verify(3.14) === 3.14;
      positiveNumber.verify(0) === 0;

      // 👎
      positiveNumber.verify(-42);             // throws
      positiveNumber.verify(Infinity);        // throws
      positiveNumber.verify(NaN);             // throws
      positiveNumber.verify('not a number');  // throws
      positiveNumber.verify(-0);              // throws
```

