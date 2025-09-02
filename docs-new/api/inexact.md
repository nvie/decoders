---
title: inexact
description: Objects decoder
---

# `inexact` decoder

```typescript
inexact<A, B, ...>(null: { field1: Decoder<A>, field2: Decoder<B>, ... }): Decoder<{ field1: A, field2: B, ... }>
```

[View source](https://github.com/nvie/decoders/tree/main/src/objects.ts#L165-L200)

Like `object()`, but will pass through any extra fields on the input object
unvalidated that will thus be of `unknown` type statically.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="inexact({ x: number })" />

## Code Examples


      ```ts
      const decoder = inexact({
        x: number,
        y: number,
      });

      // 👍
      decoder.verify({ x: 1, y: 2 }) === { x: 1, y: 2 };
      decoder.verify({ x: 1, y: 2, z: 3 }) === { x: 1, y: 2, z: 3 };

      // 👎
      decoder.verify({ x: 1 });  // throws, missing field `y`
      ```

      For more information, see also [The difference between ``object``, ``exact``, and ``inexact``](./tips.html#the-difference-between-object-exact-and-inexact).
    

