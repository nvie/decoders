---
title: constant
description: Constants decoder
---

# `constant` decoder

```typescript
constant<T>(value: T): Decoder<T>
```

[View source](https://github.com/nvie/decoders/tree/main/src/basics.ts#L91-L100)

Accepts only the given constant value.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="constant("hello")" />

## Code Examples

```typescript
const decoder = constant('hello');

      // 👍
      decoder.verify('hello') === 'hello';

      // 👎
      decoder.verify('this breaks');  // throws
      decoder.verify(false);          // throws
      decoder.verify(undefined);      // throws
```

