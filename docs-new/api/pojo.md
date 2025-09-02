---
title: pojo
description: Objects decoder
---

# `pojo` decoder

```typescript
pojo(): Decoder<Record<string, unknown>>
```

[View source](https://github.com/nvie/decoders/tree/main/src/objects.ts#L47-L53)

Accepts any "plain old JavaScript object", but doesn't validate its keys or
values further.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="pojo" />

## Code Examples

```typescript
// 👍
      pojo.verify({}) === {};
      pojo.verify({ name: 'hi' }) === { name: 'hi' };

      // 👎
      pojo.verify('hi');        // throws
      pojo.verify([]);          // throws
      pojo.verify(new Date());  // throws
      pojo.verify(null);        // throws
```

