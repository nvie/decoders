---
title: datelike
description: Dates decoder
---

# `datelike` decoder

```typescript
datelike(): Decoder<Date>
```

[View source](https://github.com/nvie/decoders/tree/main/src/dates.ts#L41-L46)

Accepts either a Date, or an ISO date string, returns a Date instance.
This is commonly useful to build decoders that can be reused to validate
object with Date instances as well as objects coming from JSON payloads.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="datelike" />

## Code Examples

```typescript
// 👍
      datelike.verify('2024-01-08T12:00:00Z'); // strings...
      datelike.verify(new Date());             // ...or Date instances

      // 👎
      datelike.verify('2020-06-01');  // throws
      datelike.verify('hello');       // throws
      datelike.verify(123);           // throws
```

