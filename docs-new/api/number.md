---
title: number
description: Numbers decoder
---

# `number` decoder

```typescript
number(): Decoder<number>
```

[View source](https://github.com/nvie/decoders/tree/main/src/numbers.ts#L16-L23)

Accepts finite numbers (can be integer or float values). Values `NaN`,
or positive and negative `Infinity` will get rejected.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="number" />

## Code Examples

```typescript
// 👍
      number.verify(123) === 123;
      number.verify(-3.14) === -3.14;

      // 👎
      number.verify(Infinity);        // throws
      number.verify(NaN);             // throws
      number.verify('not a number');  // throws
```

