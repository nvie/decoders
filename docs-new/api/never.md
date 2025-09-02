---
title: never
description: Utilities decoder
---

# `never` decoder

```typescript
never(): Decoder<never>
```

[View source](https://github.com/nvie/decoders/tree/main/src/basics.ts#L118-L124)

Rejects all inputs, and always fails with the given error message. May be
useful for explicitly disallowing keys, or for testing purposes.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="never" />

## Code Examples

```typescript
const decoder = object({
        a: string,
        b: optional(never('Key b has been removed')),
      });

      // 👍
      decoder.verify({ a: 'foo' });            // { a: 'foo' };
      decoder.verify({ a: 'foo', c: 'bar' });  // { a: 'foo' };

      // 👎
      decoder.verify({ a: 'foo', b: 'bar' });  // throws
```

## Aliases

- `fail`

