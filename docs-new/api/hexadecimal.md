---
title: hexadecimal
description: Strings decoder
---

# `hexadecimal` decoder

```typescript
hexadecimal(): Decoder<string>
```

[View source](https://github.com/nvie/decoders/tree/main/src/strings.ts#L140-L146)

Accepts and returns strings with hexadecimal digits only (base-16).

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="hexadecimal" />

## Code Examples

```typescript
const decoder = hexadecimal;

      // 👍
      decoder.verify('0123456789ABCDEF') === '0123456789ABCDEF';
      decoder.verify('deadbeef') === 'deadbeef';

      // 👎
      decoder.verify('abcdefghijklm');  // throws (not hexadecimal)
      decoder.verify('');     // throws
      decoder.verify('1');    // throws
```

