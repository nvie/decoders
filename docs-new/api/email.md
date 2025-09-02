---
title: email
description: Strings decoder
---

# `email` decoder

```typescript
email(): Decoder<string>
```

[View source](https://github.com/nvie/decoders/tree/main/src/strings.ts#L59-L67)

Accepts and returns strings that are syntactically valid email addresses.
(This will not mean that the email address actually exist.)

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="email" />

## Code Examples

```typescript
// 👍
      email.verify('alice@acme.org') === 'alice@acme.org';

      // 👎
      email.verify('foo');               // throws
      email.verify('@acme.org');         // throws
      email.verify('alice @ acme.org');  // throws
```

