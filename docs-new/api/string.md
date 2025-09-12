---
title: string
description: Strings decoder
---

# `string`

<Signature name="string" noFunc />

```typescript
string: Decoder<string>;
```

[View source](https://github.com/nvie/decoders/tree/main/src/strings.ts#L20-L25)

Accepts and returns strings.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="string" />

## Code Examples

```typescript
// 👍
string.verify('hello world') === 'hello world';
string.verify('🚀') === '🚀';
string.verify('') === '';

// 👎
string.verify(123); // throws
string.verify(true); // throws
string.verify(null); // throws
```
