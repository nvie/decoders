---
title: record
description: Collections decoder
---

# `record` decoder

```typescript
record<V>(values: Decoder<V>): Decoder<Record<string, V>>
```

```typescript
record<K, V>(keys: Decoder<K>, values: Decoder<V>): Decoder<Record<K, V>>
```

[View source](https://github.com/nvie/decoders/tree/main/src/collections.ts#L8-L57)

Accepts objects where all values match the given decoder, and returns the
result as a `Record<string, V>`.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="record(number)" />

## Code Examples


      This is useful to validate inputs like `{ [key: string]: V }`.

      #### Decoding values only

      The default call takes a single argument and will validate all _values_.
      For example, to validate that all values in the object are numbers:

      ```ts
      const decoder = record(number);
      //                        \ 
      //                      Values must be numbers

      // 👍
      decoder.verify({ red: 1, blue: 2, green: 3 });

      // 👎
      decoder.verify({ hi: 'not a number' });
      ```

      #### Decoding keys and values

      If you also want to validate that keys are of a specific form, use the
      two-argument form: `record(key, value)`. Note that the given key decoder
      must return strings.

      For example, to enforce that all keys are emails:

      ```ts
      const decoder = record(email, number);
      //                      /        \ 
      //              Keys must        Values must
      //             be emails           be numbers

      // 👍
      decoder.verify({ "me@nvie.com": 1 });

      // 👎
      decoder.verify({ "no-email": 1 });
      ```
    

