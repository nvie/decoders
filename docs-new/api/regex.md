---
title: regex
description: Strings decoder
---

# `regex` decoder

```typescript
regex(pattern: RegExp, message: string): Decoder<string>
```

[View source](https://github.com/nvie/decoders/tree/main/src/strings.ts#L32-L37)

Accepts and returns strings that match the given regular expression.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="regex(/^[0-9]+$/, 'Must be numeric')" />

## Code Examples

```typescript
const decoder = regex(/^[0-9][0-9]+$/, 'Must be numeric');

// 👍
decoder.verify('42') === '42';
decoder.verify('83401648364738') === '83401648364738';

// 👎
decoder.verify(''); // throws
decoder.verify('1'); // throws
decoder.verify('foo'); // throws
```
