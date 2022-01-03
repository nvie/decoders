---
title: The difference between `object`, `exact`, and `inexact`
parent: API Reference
---

# The difference between `object`, `exact`, and `inexact`

The three decoders in the "object" family of decoders only differ in how they treat extra
properties on input values.

For example, for a definition like:

```js
import { exact, inexact, number, object, string } from 'decoders';

const thing = {
    a: string,
    b: number,
};
```

And a runtime input of:

```js
{
  a: "hi",
  b: 42,
  c: "extra",  // Note "c" is not a known field
}
```

|                  | Extra properties | Output value                   | Inferred type                               |
| ---------------- | ---------------- | ------------------------------ | ------------------------------------------- |
| `object(thing)`  | discarded        | `{a: "hi", b: 42}`             | `{a: string, b: number}`                    |
| `exact(thing)`   | not allowed      | ⚡️ Runtime error              | `{a: string, b: number}`                    |
| `inexact(thing)` | retained         | `{a: "hi", b: 42, c: "extra"}` | `{a: string, b: number, [string]: unknown}` |
