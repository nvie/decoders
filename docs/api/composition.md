---
title: Composition
parent: API Reference
nav_order: 11
---

# Composition

## Table of Contents

-   [`map`](#map)
-   [`compose`](#compose)
-   [`predicate`](#predicate)

---

<a name="map" href="#map">#</a> <b>map</b><i>&lt;T, V&gt;</i>(<i>Decoder&lt;T&gt;</i>,
<i>&lt;T&gt;</i> =&gt; <i>&lt;V&gt;</i>): <i>Decoder&lt;V&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/utils.js 'Source')<br />

Accepts any value the given decoder accepts, and on success, will call the mapper value
**on the decoded result**. If the mapper function throws an error, the whole decoder will
fail using the error message as the failure reason.

<!-- prettier-ignore-start -->
```javascript
const upper = map(string, (s) => s.toUpperCase());
const verify = guard(upper);

// 👍
verify('foo') === 'FOO';

// 👎
verify(4);  // throws
```
<!-- prettier-ignore-end -->

---

<a name="compose" href="#compose">#</a> <b>compose</b><i>&lt;T,
V&gt;</i>(<i>Decoder&lt;T&gt;</i>, <i>Decoder&lt;V, T&gt;</i>): <i>Decoder&lt;V&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/composition.js 'Source')<br />

Given a decoder for _T_ and another one for _V_-given-a-_T_. Will first decode the input
using the first decoder, and _if okay_, pass the result on to the second decoder. The
second decoder will thus be able to make more assumptions about its input value, i.e. it
can know what type the input value is (`T` instead of `unknown`).

This is an advanced decoder, typically only useful for authors of decoders. It's not
recommended to rely on this decoder directly for normal usage.

---

<a name="predicate" href="#predicate">#</a>
<b>predicate</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>, <i>&lt;T&gt; => boolean</i>,
string): <i>Decoder&lt;T&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/composition.js 'Source')<br />

Accepts values that are accepted by the decoder _and_ also pass the predicate function.

<!-- prettier-ignore-start -->
```typescript
const odd = predicate(
  number,
  (n) => n % 2 !== 0,
  'Must be odd'
);
const verify = guard(odd);

// 👍
verify(3) === 3;

// 👎
verify('hi');  // throws: not a number
verify(42);    // throws: not an odd number
```
<!-- prettier-ignore-end -->

In TypeScript, if you provide a predicate that also doubles as a [type
predicate][type-predicates], then this will be reflected in the return type, too.
