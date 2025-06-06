---
title: Tips
parent: Guides
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

|                                       | Read-only   | Extra properties | Output value                   | Inferred type                               |
| ------------------------------------- | ----------- | ---------------- | ------------------------------ | ------------------------------------------- |
| [`object(thing)`](/api.html#object)   | no\*\*      | discarded        | `{a: "hi", b: 42}`             | `{a: string, b: number}`                    |
| [`exact(thing)`](/api.html#exact)     | inherited\* | not allowed      | n/a (rejected)                 | `{a: string, b: number}`                    |
| [`inexact(thing)`](/api.html#inexact) | inherited\* | retained         | `{a: "hi", b: 42, c: "extra"}` | `{a: string, b: number, [string]: unknown}` |

\*: The read-only behavior of `exact` and `inexact` is inherited from the field decoders
that are provided. If all fields are read-only, then the `exact` or `inexact` decoder
itself will also be read-only.

\*\*: Note that the `object` decoder is never read-only, because it will always create a
new object that has exactly the keys provided.
