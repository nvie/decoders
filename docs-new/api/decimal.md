---
title: decimal
description: Strings decoder
---

# `decimal` decoder

```typescript
decimal(): Decoder<string>
```

[View source](https://github.com/nvie/decoders/tree/main/src/strings.ts#L134-L138)

Accepts and returns strings with decimal digits only (base-10).
To convert these to numbers, use the `numeric` decoder.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="decimal" />

## Code Examples

```typescript
const decoder = decimal;

      // 👍
      decoder.verify('42') === '42';
      decoder.verify('83401648364738') === '83401648364738';

      // 👎
      decoder.verify('');        // throws
      decoder.verify('123abc');  // throws
      decoder.verify('foo');     // throws
      decoder.verify(123);       // throws (not a string)
```

