---
title: set
description: Collections decoder
---

# `set` decoder

```typescript
set<T>(decoder: Decoder<T>): Decoder<Set<T>>
```

[View source](https://github.com/nvie/decoders/tree/main/src/collections.ts#L74-L80)


      An alias of `setFromArray()`.

      ⚠️ **IMPORTANT!** This decoder will change its behavior in a future
      version! If you rely on this decoder, use `setFromArray()` instead.
    

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="setFromArray(string)" />

