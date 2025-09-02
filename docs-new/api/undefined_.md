---
title: undefined_
description: Optionality decoder
---

# `undefined_` decoder

```typescript
undefined_(): Decoder<undefined>
```

[View source](https://github.com/nvie/decoders/tree/main/src/basics.ts#L17-L20)

Accepts and returns only the literal `undefined` value.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="undefined_" />

## Code Examples

```typescript
// 👍
      undefined_.verify(undefined) === undefined;

      // 👎
      undefined_.verify(null);          // throws
      undefined_.verify(false);         // throws
      undefined_.verify('hello world'); // throws
```

