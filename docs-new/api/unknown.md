---
title: unknown
description: Optionality decoder
---

# `unknown` decoder

```typescript
unknown(): Decoder<unknown>
```

[View source](https://github.com/nvie/decoders/tree/main/src/basics.ts#L138-L145)

Accepts anything and returns it unchanged.

Useful for situation in which you don't know or expect a specific type. Of
course, the downside is that you won't know the type of the value statically
and you'll have to further refine it yourself.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="unknown" />

## Code Examples

```typescript
// 👍
      unknown.verify('hello') === 'hello';
      unknown.verify(false) === false;
      unknown.verify(undefined) === undefined;
      unknown.verify([1, 2]) === [1, 2];

      // 👎
      // This decoder will never reject an input
```

## Aliases

- `mixed`

