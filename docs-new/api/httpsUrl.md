---
title: httpsUrl
description: Strings decoder
---

# `httpsUrl` decoder

```typescript
httpsUrl(): Decoder<URL>
```

[View source](https://github.com/nvie/decoders/tree/main/src/strings.ts#L77-L84)

Accepts strings that are valid URLs, but only HTTPS ones. Returns the value
as a URL instance.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="httpsUrl" />

## Code Examples


      ```ts
      // 👍
      httpsUrl.verify('https://nvie.com:443') === new URL('https://nvie.com/');

      // 👎
      httpsUrl.verify('http://nvie.com');                        // throws, not HTTPS
      httpsUrl.verify('git+ssh://user@github.com/foo/bar.git');  // throws, not HTTPS
      ```

      **Tip!** If you need to limit URLs to different protocols than HTTP, you can do as the HTTPS decoder is implemented: by adding further conditions using a `.refine()` call.

      ```ts
      import { url } from 'decoders';

      const gitUrl: Decoder<URL> = url.refine(
        (value) => value.protocol === 'git:',
        'Must be a git:// URL',
      );
      ```
    

