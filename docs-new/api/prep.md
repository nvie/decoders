---
title: prep
description: Utilities decoder
---

# `prep` decoder

```typescript
prep<T>(mapperFn: (raw: mixed) => mixed, decoder: Decoder<T>): Decoder<T>
```

[View source](https://github.com/nvie/decoders/tree/main/src/misc.ts#L31-L61)

Pre-process the data input before passing it into the decoder. This gives
you the ability to arbitrarily customize the input on the fly before passing
it to the decoder. Of course, the input value at that point is still of
``unknown`` type, so you will have to deal with that accordingly.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="prep(x => parseInt(x), positiveInteger)" />

## Code Examples

```typescript
const decoder = prep(
        // Will convert any input to an int first, before feeding it to
        // positiveInteger. This will effectively also allow numeric strings
        // to be accepted (and returned) as integers. If this ever throws,
        // then the error message will be what gets annotated on the input.
        x => parseInt(x),
        positiveInteger,
      );

      // 👍
      decoder.verify(42) === 42;
      decoder.verify('3') === 3;

      // 👎
      decoder.verify('-3');  // throws: not a positive number
      decoder.verify('hi');  // throws: not a number
```

