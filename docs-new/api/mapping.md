---
title: mapping
description: Collections decoder
---

# `mapping` decoder

```typescript
mapping<T>(decoder: Decoder<T>): Decoder<Map<string, T>>
```

[View source](https://github.com/nvie/decoders/tree/main/src/collections.ts#L82-L89)

Similar to `record()`, but returns the result as a `Map<string, T>` (an [ES6
Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map))
instead.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="mapping(number)" />

## Code Examples

```typescript
const decoder = mapping(number);

      // 👍
      decoder.verify({ red: 1, blue: 2, green: 3 });
      // Map([
      //   ['red', '1'],
      //   ['blue', '2'],
      //   ['green', '3'],
      // ]);
```

