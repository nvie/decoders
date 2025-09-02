---
title: nullable
description: Optionality decoder
---

# `nullable` decoder

```typescript
nullable<T>(decoder: Decoder<T>): Decoder<T | null>
```

```typescript
nullable<T, V>(decoder: Decoder<T>, defaultValue: V | (() => V)): Decoder<T | V>
```

[View source](https://github.com/nvie/decoders/tree/main/src/basics.ts#L46-L63)

Accepts whatever the given decoder accepts, or `null`.

If a default value is explicitly provided, return that instead in the `null`
case.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="nullable(string)" />

## Code Examples


      ```ts
      const decoder = nullable(string);

      // 👍
      decoder.verify('hello') === 'hello';
      decoder.verify(null) === null;

      // 👎
      decoder.verify(undefined);  // throws
      decoder.verify(0);          // throws
      decoder.verify(42);         // throws
      ```

      Or use it with a default value:

      ```ts
      const decoder = nullable(iso8601, () => new Date());

      decoder.verify('2022-01-01T12:00:00Z') === '2022-01-01T12:00:00Z';
      decoder.verify(null);  // the current date
      ```
    

