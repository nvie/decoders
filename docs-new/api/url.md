---
title: url
description: Strings decoder
---

# `url` decoder

```typescript
url(): Decoder<URL>
```

[View source](https://github.com/nvie/decoders/tree/main/src/strings.ts#L69-L75)

Accepts strings that are valid URLs, returns the value as a URL instance.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="url" />

## Code Examples

```typescript
// 👍
      url.verify('http://nvie.com') === new URL('http://nvie.com/');
      url.verify('https://nvie.com') === new URL('https://nvie.com/');
      url.verify('git+ssh://user@github.com/foo/bar.git') === new URL('git+ssh://user@github.com/foo/bar.git');

      // 👎
      url.verify('foo');               // throws
      url.verify('@acme.org');         // throws
      url.verify('alice @ acme.org');  // throws
      url.verify('/search?q=foo');     // throws
```

