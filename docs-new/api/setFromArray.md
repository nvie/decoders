---
title: setFromArray
description: Collections decoder
---

# `setFromArray` decoder

```typescript
setFromArray<T>(decoder: Decoder<T>): Decoder<Set<T>>
```

[View source](https://github.com/nvie/decoders/tree/main/src/collections.ts#L66-L72)

Similar to `array()`, but returns the result as an [ES6
Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="setFromArray(string)" />

## Code Examples

```typescript
const decoder = setFromArray(string);

      // 👍
      decoder.verify(['abc', 'pqr'])  // new Set(['abc', 'pqr'])
      decoder.verify([])              // new Set([])

      // 👎
      decoder.verify([1, 2]);         // throws, not the right types
```

