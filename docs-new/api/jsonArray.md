---
title: jsonArray
description: JSON values decoder
---

# `jsonArray` decoder

```typescript
jsonArray(): Decoder<JSONValue[]>
```

[View source](https://github.com/nvie/decoders/tree/main/src/json.ts#L21-L24)

Accepts arrays that contain only valid JSON values.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="jsonArray" />

## Code Examples

```typescript
// 👍
      jsonArray.verify([]);                  // []
      jsonArray.verify([{ name: 'Amir' }]);  // [{ name: 'Amir' }]

      // 👎
      jsonArray.verify({});                 // throws
      jsonArray.verify({ name: 'Alice' });  // throws
      jsonArray.verify('hello');            // throws
      jsonArray.verify(null);               // throws
```

