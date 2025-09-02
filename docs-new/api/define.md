---
title: define
description: Utilities decoder
---

# `define` decoder

```typescript
define<T>(fn: (blob: unknown, ok, err) => DecodeResult<T>): Decoder<T>
```

[View source](https://github.com/nvie/decoders/tree/main/src/core/Decoder.ts#L158-L355)

Defines a new `Decoder<T>`, by implementing a custom acceptance function.
The function receives three arguments:

1. `blob` - the raw/unknown input (aka your external data)
2. `ok` - Call `ok(value)` to accept the input and return ``value``
3. `err` - Call `err(message)` to reject the input with error ``message``

The expected return value should be a `DecodeResult<T>`, which can be
obtained by returning the result of calling the provided `ok` or `err`
helper functions. Please note that `ok()` and `err()` don't perform side
effects! You'll need to _return_ those values.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="define((blob, ok, err) => typeof blob === "string" ? ok(blob.toUpperCase()) : err("Must be string"))" />

## Code Examples


      > _**NOTE:** This is the lowest-level API to define a new decoder, and therefore not recommended unless you have a very good reason for it. Most cases can be covered more elegantly by starting from an existing decoder and using `.transform()` or `.refine()` on them instead._

      ```ts
      // NOTE: Please do NOT implement an uppercase decoder like this! 😇
      const uppercase: Decoder<string> = define(
        (blob, ok, err) => {
          if (typeof blob === 'string') {
            // Accept the input
            return ok(blob.toUpperCase());
          } else {
            // Reject the input
            return err('I only accept strings as input');
          }
        }
      );

      // 👍
      uppercase.verify('hi there') === 'HI THERE';

      // 👎
      uppercase.verify(123);   // throws: 123
                               //         ^^^ I only accept strings as input
      ```

      The above example is just an example to illustrate how `define()` works. It would be more idiomatic to implement an uppercase decoder as follows:

      ```ts
      const uppercase: Decoder<string> = string.transform(s => s.toUpperCase());
      ```
    

