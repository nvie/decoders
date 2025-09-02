---
title: identifier
description: Strings decoder
---

# `identifier` decoder

```typescript
identifier(): Decoder<string>
```

[View source](https://github.com/nvie/decoders/tree/main/src/strings.ts#L86-L93)

Accepts and returns strings that are valid identifiers in most programming
languages.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="identifier" />

## Code Examples

```typescript
// 👍
      identifier.verify('x') === 'x'
      identifier.verify('abc123') === 'abc123'
      identifier.verify('_123') === '_123'
      identifier.verify('a_b_c_1_2_3') === 'a_b_c_1_2_3'

      // 👎
      identifier.verify('123xyz');   // cannot start with digit
      identifier.verify('x-y');      // invalid chars
      identifier.verify('!@#$%^&*()=+');  // invalid chars
      identifier.verify('🤯');       // invalid chars
      identifier.verify(42);         // not a string
```

