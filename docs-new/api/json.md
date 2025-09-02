---
title: json
description: JSON values decoder
---

# `json` decoder

```typescript
json(): Decoder<JSONValue>
```

[View source](https://github.com/nvie/decoders/tree/main/src/json.ts#L26-L49)

Accepts any value that's a valid JSON value.

In other words: any value returned by `JSON.parse()` should decode without
failure.

```typescript
type JSONValue =
    | null
    | string
    | number
    | boolean
    | { [string]: JSONValue }
    | JSONValue[]
```

## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="json" />

## Code Examples

```typescript
// 👍
      json.verify({
        name: 'Amir',
        age: 27,
        admin: true,
        image: null,
        tags: ['vip', 'staff'],
      });
```

