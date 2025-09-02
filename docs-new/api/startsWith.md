---
title: startsWith
description: Strings decoder
---

# `startsWith` decoder

```typescript
startsWith(prefix: P): Decoder<\`${P}${string}\`>
```

[View source](https://github.com/nvie/decoders/tree/main/src/strings.ts#L39-L47)

Accepts and returns strings that start with the given prefix.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="startsWith("hello")" />

## Code Examples

```typescript
const decoder = startsWith('abc');

      // 👍
      decoder.verify('abc') === 'abc';
      decoder.verify('abcdefg') === 'abcdefg';

      // 👎
      decoder.verify(42);     // throws
      decoder.verify('ab');   // throws
      decoder.verify('ABC');  // throws
```

