---
title: anyNumber
description: Numbers decoder
---

# `anyNumber` decoder

```typescript
anyNumber(): Decoder<number>
```

[View source](https://github.com/nvie/decoders/tree/main/src/numbers.ts#L5-L14)

Accepts any valid ``number`` value.

This also accepts special values like `NaN` and `Infinity`. Unless you
want to deliberately accept those, you'll likely want to use the
`number` decoder instead.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="anyNumber" />

## Code Examples

```typescript
// 👍
      anyNumber.verify(123) === 123;
      anyNumber.verify(-3.14) === -3.14;
      anyNumber.verify(Infinity) === Infinity;
      anyNumber.verify(NaN) === NaN;

      // 👎
      anyNumber.verify('not a number');  // throws
```

