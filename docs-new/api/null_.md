---
title: null_
description: Optionality decoder
---

# `null_` decoder

```typescript
null_(): Decoder<null>
```

[View source](https://github.com/nvie/decoders/tree/main/src/basics.ts#L12-L15)

Accepts and returns only the literal `null` value.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="null_" />

## Code Examples

```typescript
// 👍
      null_.verify(null) === null;

      // 👎
      null_.verify(false);         // throws
      null_.verify(undefined);     // throws
      null_.verify('hello world'); // throws
```

