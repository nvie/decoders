---
title: Arrays
parent: API Reference
nav_order: 7
---

# Arrays

## Table of Contents

-   [`array`](#array)
-   [`nonEmptyArray`](#nonEmptyArray)
-   [`poja`](#poja)
-   [`tuple`](#tuple)

---

<a name="array" href="#array">#</a> <b>array</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>):
<i>Decoder&lt;Array&lt;T&gt;&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/array.js 'Source')

Accepts only arrays of whatever the given decoder accepts.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(array(string));

// 👍
verify(['hello', 'world']) === ['hello', 'world'];

// 👎
verify(['hello', 1.2]);  // throws
```
<!-- prettier-ignore-end -->

---

<a name="nonEmptyArray" href="#nonEmptyArray">#</a>
<b>nonEmptyArray</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>):
<i>Decoder&lt;Array&lt;T&gt;&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/array.js 'Source')

Like `array()`, but will reject arrays with 0 elements.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(nonEmptyArray(string));

// 👍
verify(['hello', 'world']) === ['hello', 'world'];

// 👎
verify(['hello', 1.2]);  // throws
verify([]);              // throws
```
<!-- prettier-ignore-end -->

---

<a name="poja" href="#poja">#</a> <b>poja</b>: <i>Decoder&lt;Array&lt;unknown&gt;&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/array.js 'Source')

Accepts any array, but doesn't validate its items further.

"poja" means "plain old JavaScript array", a play on ["pojo"](#pojo).

<!-- prettier-ignore-start -->
```javascript
const verify = guard(poja);

// 👍
verify([1, 'hi', true]) === [1, 'hi', true];
verify(['hello', 'world']) === ['hello', 'world'];
verify([]) === [];

// 👎
verify({});    // throws
verify('hi');  // throws
```
<!-- prettier-ignore-end -->

---

<a name="tuple" href="#tuple">#</a> <b>tuple</b><i>&lt;A, B, C,
...&gt;</i>(<i>Decoder&lt;A&gt;</i>, <i>Decoder&lt;B&gt;</i>, <i>Decoder&lt;C&gt;</i>):
<i>Decoder&lt;[A, B, C, ...]&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/tuple.js 'Source')

Accepts a tuple (an array with exactly _n_ items) of values accepted by the _n_ given
decoders.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(tuple(string, number));

// 👍
verify(['hello', 1.2]) === ['hello', 1.2];

// 👎
verify([]);                  // throws, too few items
verify(['hello', 'world']);  // throws, not the right types
verify(['a', 1, 'c']);       // throws, too many items
```
<!-- prettier-ignore-end -->
