---
title: nonEmptyString
description: Strings decoder
---

# `nonEmptyString` decoder

```typescript
nonEmptyString(): Decoder<string>
```

[View source](https://github.com/nvie/decoders/tree/main/src/strings.ts#L27-L30)

Like `string`, but will reject the empty string or strings containing only whitespace.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="nonEmptyString" />

## Code Examples

```typescript
// 👍
      nonEmptyString.verify('hello world') === 'hello world';
      nonEmptyString.verify('🚀') === '🚀';

      // 👎
      nonEmptyString.verify(123);   // throws
      nonEmptyString.verify('  ');  // throws
      nonEmptyString.verify('');    // throws
```

