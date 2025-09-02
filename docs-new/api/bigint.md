---
title: bigint
description: Numbers decoder
---

# `bigint` decoder

```typescript
bigint(): Decoder<bigint>
```

[View source](https://github.com/nvie/decoders/tree/main/src/numbers.ts#L49-L54)

Accepts any valid ``bigint`` value.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="bigint" />

## Code Examples

```typescript
// 👍
      bigint.verify(123n) === 123n;
      bigint.verify(-4543000000n) === -4543000000n;

      // 👎
      bigint.verify(123);             // throws
      bigint.verify(-3.14);           // throws
      bigint.verify(Infinity);        // throws
      bigint.verify(NaN);             // throws
      bigint.verify('not a number');  // throws
```

