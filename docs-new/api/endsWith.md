---
title: endsWith
description: Strings decoder
---

# `endsWith` decoder

```typescript
endsWith(suffix: S): Decoder<\`${string}${S}\`>
```

[View source](https://github.com/nvie/decoders/tree/main/src/strings.ts#L49-L57)

Accepts and returns strings that end with the given suffix.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="endsWith("world")" />

## Code Examples

```typescript
const decoder = endsWith('bar');

      // 👍
      decoder.verify('bar') === 'bar';
      decoder.verify('foobar') === 'foobar';

      // 👎
      decoder.verify(42);      // throws
      decoder.verify('Bar');   // throws
      decoder.verify('bark');  // throws
```

