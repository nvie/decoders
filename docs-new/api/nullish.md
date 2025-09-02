---
title: nullish
description: Optionality decoder
---

# `nullish` decoder

```typescript
nullish<T>(decoder: Decoder<T>): Decoder<T | null | undefined>
```

```typescript
nullish<T, V>(decoder: Decoder<T>, defaultValue: V | (() => V)): Decoder<T | V>
```

[View source](https://github.com/nvie/decoders/tree/main/src/basics.ts#L72-L89)

Accepts whatever the given decoder accepts, or `null`, or `undefined`.

If a default value is explicitly provided, return that instead in the
`null`/`undefined` case.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="nullish(string)" />

## Code Examples


      ```ts
      const decoder = nullish(string);

      // 👍
      decoder.verify('hello') === 'hello';
      decoder.verify(null) === null;
      decoder.verify(undefined) === undefined;

      // 👎
      decoder.verify(0);   // throws
      decoder.verify(42);  // throws
      ```

      Or use it with a default value:

      ```ts
      const decoder = nullish(string, null);

      decoder.verify('hello') === 'hello';
      decoder.verify(null) === null;
      decoder.verify(undefined) === null;
      ```
    

## Aliases

- `maybe`

