---
title: exact
description: Objects decoder
---

# `exact` decoder

```typescript
exact<A, B, ...>(null: { field1: Decoder<A>, field2: Decoder<B>, ... }): Decoder<{ field1: A, field2: B, ... }>
```

[View source](https://github.com/nvie/decoders/tree/main/src/objects.ts#L138-L163)

Like `object()`, but will reject inputs that contain extra fields that are
not specified explicitly.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="exact({ x: number })" />

## Code Examples


      ```ts
      const decoder = exact({
        x: number,
        y: number,
      });

      // 👍
      decoder.verify({ x: 1, y: 2 }) === { x: 1, y: 2 };

      // 👎
      decoder.verify({ x: 1, y: 2, z: 3 });  // throws, extra field `z` not allowed
      decoder.verify({ x: 1 });              // throws, missing field `y`
      ```

      For more information, see also [The difference between ``object``, ``exact``, and ``inexact``](./tips.html#the-difference-between-object-exact-and-inexact).
    

