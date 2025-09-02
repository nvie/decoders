---
title: array
description: Arrays decoder
---

# `array` decoder

```typescript
array(decoder: Decoder<T>): Decoder<T[]>
```

[View source](https://github.com/nvie/decoders/tree/main/src/arrays.ts#L16-L46)

Accepts arrays of whatever the given decoder accepts.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="array(string)" />

## Code Examples

```typescript
const decoder = array(string);

      // 👍
      decoder.verify(['hello', 'world']) === ['hello', 'world'];
      decoder.verify([]) === [];

      // 👎
      decoder.verify(['hello', 1.2]);  // throws
```

