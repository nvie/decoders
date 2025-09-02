---
title: instanceOf
description: Utilities decoder
---

# `instanceOf` decoder

```typescript
instanceOf<T>(klass: Klass<T>): Decoder<T>
```

[View source](https://github.com/nvie/decoders/tree/main/src/misc.ts#L12-L21)

Accepts any value that is an ``instanceof`` the given class.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="instanceOf(Error)" />

## Code Examples

```typescript
const decoder = instanceOf(Error);

      // 👍
      const value = new Error('foo');
      decoder.verify(value) === value;

      // 👎
      decoder.verify('foo');  // throws
      decoder.verify(3);      // throws
```

