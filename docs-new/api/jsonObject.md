---
title: jsonObject
description: JSON values decoder
---

# `jsonObject` decoder

```typescript
jsonObject(): Decoder<{ [string]: JSONValue }>
```

[View source](https://github.com/nvie/decoders/tree/main/src/json.ts#L16-L19)

Accepts objects that contain only valid JSON values.

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="jsonObject" />

## Code Examples

```typescript
// 👍
      jsonObject.verify({});                // {}
      jsonObject.verify({ name: 'Amir' });  // { name: 'Amir' }

      // 👎
      jsonObject.verify([]);                   // throws
      jsonObject.verify([{ name: 'Alice' }]);  // throws
      jsonObject.verify('hello');              // throws
      jsonObject.verify(null);                 // throws
```

