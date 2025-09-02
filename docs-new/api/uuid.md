---
title: uuid
description: Strings decoder
---

# `uuid` decoder

```typescript
uuid(): Decoder<string>
```

[View source](https://github.com/nvie/decoders/tree/main/src/strings.ts#L106-L114)

Accepts strings that are valid
[UUIDs](https://en.wikipedia.org/wiki/universally_unique_identifier)
(universally unique identifier).

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="uuid" />

## Code Examples

```typescript
// 👍
      uuid.verify('123e4567-e89b-12d3-a456-426614174000') === '123e4567-e89b-12d3-a456-426614174000'
      uuid.verify('123E4567-E89B-12D3-A456-426614174000') === '123E4567-E89B-12D3-A456-426614174000'

      // 👎
      uuid.verify('123E4567E89B12D3A456426614174000');      // throws
      uuid.verify('abcdefgh-ijkl-mnop-qrst-uvwxyz012345');  // throws
```

