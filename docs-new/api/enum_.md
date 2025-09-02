---
title: enum_
description: Unions decoder
---

# `enum_` decoder

```typescript
enum_(enum: MyEnum): Decoder<MyEnum>
```

[View source](https://github.com/nvie/decoders/tree/main/src/unions.ts#L99-L120)

Accepts and return an enum value.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="enum_(Fruit)" />

## Code Examples


      It works with numeric enums:

      ```ts
      enum Fruit {
        Apple,
        Banana,
        Cherry
      }

      const decoder = enum_(Fruit);

      // 👍
      decoder.verify(Fruit.Apple) === Fruit.Apple;
      decoder.verify(Fruit.Banana) === Fruit.Banana;
      decoder.verify(Fruit.Cherry) === Fruit.Cherry;
      decoder.verify(0) === Fruit.Apple;
      decoder.verify(1) === Fruit.Banana;
      decoder.verify(2) === Fruit.Cherry;

      // 👎
      decoder.verify('Apple');  // throws
      decoder.verify(-1);       // throws
      decoder.verify(3);        // throws
      ```

      As well as with string enums:

      ```ts
      enum Fruit {
        Apple = 'a',
        Banana = 'b',
        Cherry = 'c'
      }

      const decoder = enum_(Fruit);

      // 👍
      decoder.verify(Fruit.Apple) === Fruit.Apple;
      decoder.verify(Fruit.Banana) === Fruit.Banana;
      decoder.verify(Fruit.Cherry) === Fruit.Cherry;
      decoder.verify('a') === Fruit.Apple;
      decoder.verify('b') === Fruit.Banana;
      decoder.verify('c') === Fruit.Cherry;

      // 👎
      decoder.verify('Apple');  // throws
      decoder.verify(0);        // throws
      decoder.verify(1);        // throws
      decoder.verify(2);        // throws
      decoder.verify(3);        // throws
      ```
    

