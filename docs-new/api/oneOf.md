---
title: oneOf
description: Unions decoder
---

# `oneOf` decoder

```typescript
oneOf<T>(values: T[]): Decoder<T>
```

[View source](https://github.com/nvie/decoders/tree/main/src/unions.ts#L85-L97)

Accepts any value that is strictly-equal (using `===`) to one of the
specified values.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="oneOf(["foo", "bar", "baz"])" />

## Code Examples


      ```ts
      const decoder = oneOf(['foo', 'bar', 3]);

      // 👍
      decoder.verify('foo') === 'foo';
      decoder.verify(3) === 3;

      // 👎
      decoder.verify('hello');  // throws
      decoder.verify(4);        // throws
      decoder.verify(false);    // throws
      ```

      For example, given an array of strings, like so:

      ```ts
      oneOf(['foo', 'bar']);
      ```
    

