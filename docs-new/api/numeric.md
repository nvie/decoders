---
title: numeric
description: Strings decoder
---

# `numeric` decoder

```typescript
numeric(): Decoder<number>
```

[View source](https://github.com/nvie/decoders/tree/main/src/strings.ts#L148-L153)

Accepts valid numerical strings (in base-10) and returns them as a number.
To only accept numerical strings and keep them as string values, use the
`decimal` decoder.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="numeric" />

## Code Examples

```typescript
const decoder = numeric;

      // 👍
      decoder.verify('42') === 42;
      decoder.verify('83401648364738') === 83401648364738;

      // 👎
      decoder.verify('');        // throws
      decoder.verify('123abc');  // throws
      decoder.verify('foo');     // throws
      decoder.verify(123);       // throws (not a string)
```

