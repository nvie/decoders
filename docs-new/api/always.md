---
title: always
description: Constants decoder
---

# `always` decoder

```typescript
always<T>(value: T): Decoder<T>
```

[View source](https://github.com/nvie/decoders/tree/main/src/basics.ts#L102-L116)

Accepts anything, completely ignores it, and always returns the provided
value instead.

This is useful to manually add extra fields to object decoders.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="always(42)" />

## Code Examples


      ```ts
      const decoder = always(42);

      // 👍
      decoder.verify('hello') === 42;
      decoder.verify(false) === 42;
      decoder.verify(undefined) === 42;

      // 👎
      // This decoder will never reject an input
      ```

      Or use it with a function instead of a constant:

      ```ts
      const now = always(() => new Date());

      now.verify('dummy');  // e.g. new Date('2022-02-07T09:36:58.848Z')
      ```
    

## Aliases

- `hardcoded`

