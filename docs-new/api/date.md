---
title: date
description: Dates decoder
---

# `date` decoder

```typescript
date(): Decoder<Date>
```

[View source](https://github.com/nvie/decoders/tree/main/src/dates.ts#L14-L19)

Accepts and returns `Date` instances.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="date" />

## Code Examples

```typescript
const now = new Date();

      // 👍
      date.verify(now) === now;

      // 👎
      date.verify(123);      // throws
      date.verify('hello');  // throws
```

