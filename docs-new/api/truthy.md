---
title: truthy
description: Booleans decoder
---

# `truthy` decoder

```typescript
truthy(): Decoder<boolean>
```

[View source](https://github.com/nvie/decoders/tree/main/src/booleans.ts#L11-L14)

Accepts anything and will return its "truth" value. Will never reject.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="truthy" />

## Code Examples

```typescript
// 👍
      truthy.verify(false) === false;
      truthy.verify(true) === true;
      truthy.verify(undefined) === false;
      truthy.verify('hello world') === true;
      truthy.verify('false') === true;
      truthy.verify(0) === false;
      truthy.verify(1) === true;
      truthy.verify(null) === false;

      // 👎
      // This decoder will never reject an input
```

