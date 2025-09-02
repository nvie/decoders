---
title: nanoid
description: Strings decoder
---

# `nanoid` decoder

```typescript
nanoid(): Decoder<string>
```

[View source](https://github.com/nvie/decoders/tree/main/src/strings.ts#L95-L104)

Accepts and returns [nanoid](https://zelark.github.io/nano-id-cc) string
values. It assumes the default nanoid alphabet. If you're using a custom
alphabet, use `regex()` instead.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="nanoid({ size: 10 })" />

## Code Examples

```typescript
// 👍
      nanoid().verify('1-QskICa3CaPGcKuYYTm1') === '1-QskICa3CaPGcKuYYTm1'
      nanoid().verify('vA4mt7CUWnouU6jTGbMP_') === 'vA4mt7CUWnouU6jTGbMP_'
      nanoid({ size: 7 }).verify('yH8mx-7') === 'yH8mx-7'
      nanoid({ min: 7, max: 10 }).verify('yH8mx-7') === 'yH8mx-7'
      nanoid({ min: 7, max: 10 }).verify('yH8mx-7890') === 'yH8mx-7890'

      // 👎
      nanoid().verify('123E4567E89B12D3A456426614174000'); // too long
      nanoid().verify('abcdefghijkl');                     // too short
      nanoid().verify('$*&(#%*&(');                        // invalid chars
```

