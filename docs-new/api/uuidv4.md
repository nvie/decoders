---
title: uuidv4
description: Strings decoder
---

# `uuidv4` decoder

```typescript
uuidv4(): Decoder<URL>
```

[View source](https://github.com/nvie/decoders/tree/main/src/strings.ts#L125-L132)

Like `uuid`, but only accepts
[UUIDv4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_%28random%29)
strings.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="uuidv4" />

## Code Examples

```typescript
// 👍
      uuidv4.verify('123e4567-e89b-42d3-a456-426614174000') === '123e4567-e89b-42d3-a456-426614174000'

      // 👎
      uuidv4.verify('123e4567-e89b-12d3-a456-426614174000')  // throws
```

