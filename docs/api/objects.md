---
title: Objects
parent: API Reference
nav_order: 8
---

# Objects

## Table of Contents

-   [`object`](#object)
-   [`exact`](#exact)
-   [`inexact`](#inexact)
-   [`pojo`](#pojo)
-   [`dict`](#dict)
-   [`mapping`](#mapping)
-   [The difference between `object`, `exact`, and `inexact`](#the-difference-between-object-exact-and-inexact)

---

<a name="object" href="#object">#</a> <b>object</b><i>&lt;O: { [field: string]:
Decoder&lt;any&gt; }&gt;</i>(mapping: O): <i>Decoder&lt;{ ... }&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/object.js 'Source')

Accepts object values with fields matching the given decoders. Extra fields that exist on
the input object are ignored and will not be returned.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(
    object({
        x: number,
        y: number,
    }),
);

// 👍
verify({ x: 1, y: 2 }) === { x: 1, y: 2 };
verify({ x: 1, y: 2, z: 3 }) === { x: 1, y: 2 }; // ⚠️ extra field `z` not returned!

// 👎
verify({ x: 1 });  // throws, missing field `y`
```
<!-- prettier-ignore-end -->

For more information, see also
[The difference between `object`, `exact`, and `inexact`](#the-difference-between-object-exact-and-inexact).

---

<a name="exact" href="#exact">#</a> <b>exact</b><i>&lt;O: { [field: string]:
Decoder&lt;any&gt; }&gt;</i>(mapping: O): <i>Decoder&lt;{ ... }&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/object.js 'Source')

Like `object()`, but will reject inputs that contain extra keys that are not specified
explicitly.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(
    exact({
        x: number,
        y: number,
    }),
);

// 👍
verify({ x: 1, y: 2 }) === { x: 1, y: 2 };

// 👎
verify({ x: 1, y: 2, z: 3 });  // throws, extra field `z` not allowed
verify({ x: 1 });              // throws, missing field `y`
```
<!-- prettier-ignore-end -->

For more information, see also
[The difference between `object`, `exact`, and `inexact`](#the-difference-between-object-exact-and-inexact).

---

<a name="inexact" href="#inexact">#</a> <b>inexact</b><i>&lt;O: { [field: string]:
Decoder&lt;any&gt; }&gt;</i>(mapping: O): <i>Decoder&lt;{ ... }&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/object.js 'Source')

Like `object()`, but will pass through any extra fields on the input object unvalidated
that will thus be of `unknown` type statically.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(
    inexact({
        x: number,
    }),
);

// 👍
verify({ x: 1, y: 2 }) === { x: 1, y: 2 };
verify({ x: 1, y: 2, z: 3 }) === { x: 1, y: 2, z: 3 };

// 👎
verify({ x: 1 });  // throws, missing field `y`
```
<!-- prettier-ignore-end -->

For more information, see also
[The difference between `object`, `exact`, and `inexact`](#the-difference-between-object-exact-and-inexact).

---

<a name="pojo" href="#pojo">#</a> <b>pojo</b>: <i>Decoder&lt;{ [key: string]: unknown
}&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/object.js 'Source')

Accepts any "plain old JavaScript object", but doesn't validate its keys or values
further.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(pojo);

// 👍
verify({}) === {};
verify({ name: 'hi' }) === { name: 'hi' };

// 👎
verify('hi');        // throws
verify([]);          // throws
verify(new Date());  // throws
verify(null);        // throws
```
<!-- prettier-ignore-end -->

---

<a name="dict" href="#dict">#</a> <b>dict</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>):
<i>Decoder&lt;{ [string]: T }&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/mapping.js 'Source')

Accepts objects where all values match the given decoder, and returns the result as a
`{ [string]: T }`.

The main difference between `object()` and `dict()` is that you'd typically use `object()`
if this is a record-like object, where all field names are known and the values are
heterogeneous. Whereas with `dict()` the keys are typically dynamic and the values
homogeneous, like in a dictionary, a lookup table, or a cache.

```javascript
const verify = guard(dict(person)); // Assume you have a "person" decoder already

// 👍
verify({
    1: { name: 'Alice' },
    2: { name: 'Bob' },
    3: { name: 'Charlie' },
}); // ≈ {
//     "1": { name: "Alice" },
//     "2": { name: "Bob" },
//     "3": { name: "Charlie" },
// }
```

---

<a name="mapping" href="#mapping">#</a>
<b>mapping</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>): <i>Decoder&lt;Map&lt;string,
T&gt;&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/mapping.js 'Source')

Like `dict()`, but returns the result as a `Map<string, T>` instead.

```javascript
const verify = guard(mapping(person)); // Assume you have a "person" decoder already

// 👍
verify({
    1: { name: 'Alice' },
    2: { name: 'Bob' },
    3: { name: 'Charlie' },
});
// ≈ Map([
//     ['1', { name: 'Alice' }],
//     ['2', { name: 'Bob' }],
//     ['3', { name: 'Charlie' }],
//   ]);
```

---

## The difference between `object`, `exact`, and `inexact`

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
