---
title: nonEmptyArray
description: Arrays decoder
---

# `nonEmptyArray` decoder

```typescript
nonEmptyArray(decoder: Decoder<T>): Decoder<[T, ...T[]]>
```

[View source](https://github.com/nvie/decoders/tree/main/src/arrays.ts#L52-L57)

Like `array()`, but will reject arrays with 0 elements.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="nonEmptyArray(string)" />

## Code Examples

```typescript
const decoder = nonEmptyArray(string);

      // 👍
      decoder.verify(['hello', 'world']) === ['hello', 'world'];

      // 👎
      decoder.verify(['hello', 1.2]);  // throws
      decoder.verify([]);              // throws
```

