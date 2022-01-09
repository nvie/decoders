---
title: Tips
nav_order: 50
---

## The difference between `object`, `exact`, and `inexact`

The three decoders in the "object" family of decoders—[`object()`](/api.html#object),
[`exact()`](/api.html#exact) and [`inexact()`](/api.html#inexact)—are very similar and
only differ in how they treat extra properties on input values.

For example, for a definition like:

```typescript
import { exact, inexact, number, object, string } from 'decoders';

const thing = { a: string, b: number };
```

And a runtime input of:

```typescript
{
  a: "hi",
  b: 42,
  c: "extra",  // Note "c" is not a known field
}
```

|                                       | Extra properties | Output value                   | Inferred type                               |
| ------------------------------------- | ---------------- | ------------------------------ | ------------------------------------------- |
| [`object(thing)`](/api.html#object)   | discarded        | `{a: "hi", b: 42}`             | `{a: string, b: number}`                    |
| [`exact(thing)`](/api.html#exact)     | not allowed      | n/a (rejected)                 | `{a: string, b: number}`                    |
| [`inexact(thing)`](/api.html#inexact) | retained         | `{a: "hi", b: 42, c: "extra"}` | `{a: string, b: number, [string]: unknown}` |
