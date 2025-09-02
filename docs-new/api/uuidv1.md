---
title: uuidv1
description: Strings decoder
---

# `uuidv1` decoder

```typescript
uuidv1(): Decoder<URL>
```

[View source](https://github.com/nvie/decoders/tree/main/src/strings.ts#L116-L123)

Like `uuid`, but only accepts
[UUIDv1](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_1_%28date-time_and_MAC_address%29)
strings.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="uuidv1" />

## Code Examples

```typescript
// 👍
      uuidv1.verify('123e4567-e89b-12d3-a456-426614174000') === '123e4567-e89b-42d3-a456-426614174000'

      // 👎
      uuidv1.verify('123e4567-e89b-42d3-a456-426614174000')  // throws
```

