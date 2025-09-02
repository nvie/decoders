---
title: optional
description: Optionality decoder
---

# `optional` decoder

```typescript
optional<T>(decoder: Decoder<T>): Decoder<T | undefined>
```

```typescript
optional<T, V>(decoder: Decoder<T>, defaultValue: V | (() => V)): Decoder<T | V>
```

[View source](https://github.com/nvie/decoders/tree/main/src/basics.ts#L27-L44)

Accepts whatever the given decoder accepts, or `undefined`.

If a default value is explicitly provided, return that instead in the
`undefined` case.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="optional(string)" />

## Code Examples


      ```ts
      const decoder = optional(string);

      // 👍
      decoder.verify('hello') === 'hello';
      decoder.verify(undefined) === undefined;

      // 👎
      decoder.verify(null);  // throws
      decoder.verify(0);     // throws
      decoder.verify(42);    // throws
      ```

      A typical case where `optional` is useful is in decoding objects with optional fields:

      ```ts
      object({
        id: number,
        name: string,
        address: optional(string),
      });
      ```

      Which will decode to type:

      ```ts
      {
        id: number;
        name: string;
        address?: string;
      }
      ```
    

