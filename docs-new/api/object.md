---
title: object
description: Objects decoder
---

# `object` decoder

```typescript
object<A, B, ...>(null: { field1: Decoder<A>, field2: Decoder<B>, ... }): Decoder<{ field1: A, field2: B, ... }>
```

[View source](https://github.com/nvie/decoders/tree/main/src/objects.ts#L55-L136)

Accepts objects with fields matching the given decoders. Extra fields that
exist on the input object are ignored and will not be returned.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="object({ x: number })" />

## Code Examples


      ```ts
      const decoder = object({
        x: number,
        y: number,
      });

      // 👍
      decoder.verify({ x: 1, y: 2 }) === { x: 1, y: 2 };
      decoder.verify({ x: 1, y: 2, z: 3 }) === { x: 1, y: 2 }; // ⚠️ extra field `z` not returned!

      // 👎
      decoder.verify({ x: 1 });  // throws, missing field `y`
      ```

      For more information, see also [The difference between ``object``, ``exact``, and ``inexact``](./tips.html#the-difference-between-object-exact-and-inexact).
    

