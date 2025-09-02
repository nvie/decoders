---
title: dateString
description: Dates decoder
---

# `dateString` decoder

```typescript
dateString(): Decoder<string>
```

[View source](https://github.com/nvie/decoders/tree/main/src/dates.ts#L21-L30)

Accepts and returns [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)-formatted strings.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="dateString" />

## Code Examples

```typescript
// 👍
      dateString.verify('2020-06-01T12:00:00Z');

      // 👎
      dateString.verify('2020-06-01');  // throws
      dateString.verify('hello');       // throws
      dateString.verify(123);           // throws
      dateString.verify(new Date());    // throws (does not accept dates)
```

