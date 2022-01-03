---
title: Tips
parent: API Reference
---

## The difference between `object`, `exact`, and `inexact`

The three decoders in the "object" family of decoders—[`object()`](./api#object),
[`exact()`](./api#exact) and [`inexact()`](#./api#inexact)—are very similar and only
differ in how they treat extra properties on input values.

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

|                                   | Extra properties | Output value                   | Inferred type                               |
| --------------------------------- | ---------------- | ------------------------------ | ------------------------------------------- |
| [`object(thing)`](./api#object)   | discarded        | `{a: "hi", b: 42}`             | `{a: string, b: number}`                    |
| [`exact(thing)`](./api#exact)     | not allowed      | n/a (rejected)                 | `{a: string, b: number}`                    |
| [`inexact(thing)`](./api#inexact) | retained         | `{a: "hi", b: 42, c: "extra"}` | `{a: string, b: number, [string]: unknown}` |
