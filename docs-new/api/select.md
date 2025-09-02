---
title: select
description: Unions decoder
---

# `select` decoder

```typescript
select<T, A, B, ...>(scout: Decoder<T>, selectFn: (result: T) => Decoder<A> | Decoder<B> | ...): Decoder<A | B | ...>
```

[View source](https://github.com/nvie/decoders/tree/main/src/unions.ts#L165-L182)

Briefly peek at a runtime input using a "scout" decoder first, then decide
which decoder to run on the (original) input, based on the information that
the "scout" extracted.

It serves a similar purpose as `taggedUnion()`, but is a generalization that
works even if there isn't a single discriminator, or the discriminator isn't
a string.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="select(object({ version: optional(number) }), (obj) => obj.version === 2 ? v2Decoder : v1Decoder)" />

## Code Examples


    ```ts
    const decoder = select(
      // First, validate/extract the minimal information to make a decision
      object({ version: optional(number) }),

      // Then select which decoder to run
      (obj) => {
        switch (obj.version) {
          case undefined: return v1Decoder; // Suppose v1 doesn't have a discriminating field
          case 2:         return v2Decoder;
          case 3:         return v3Decoder;
          default:        return never('Invalid version');
        }
      },
    );
    // Decoder<V1 | V2 | V3>
    ```
    

