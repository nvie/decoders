---
title: Optionality
parent: API Reference
nav_order: 6
---

# Optionality

## Table of Contents

-   [`null_`](#null_)
-   [`undefined_`](#undefined_)
-   [`optional`](#optional)
-   [`nullable`](#nullable)
-   [`maybe`](#maybe)
-   [`unknown`](#unknown)
-   [`mixed`](#mixed) (alias of `unknown`)

---

<a name="null_" href="#null_">#</a> <b>null\_</b>: <i>Decoder&lt;null&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/constants.js 'Source')

Accepts only the literal `null` value.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(null_);

// 👍
verify(null) === null;

// 👎
verify(false);         // throws
verify(undefined);     // throws
verify('hello world'); // throws
```
<!-- prettier-ignore-end -->

---

<a name="undefined_" href="#undefined_">#</a> <b>undefined\_</b>:
<i>Decoder&lt;undefined&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/constants.js 'Source')

Accepts only the literal `undefined` value.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(undefined_);

// 👍
verify(undefined) === undefined;

// 👎
verify(null);          // throws
verify(false);         // throws
verify('hello world'); // throws
```
<!-- prettier-ignore-end -->

---

<a name="optional" href="#optional">#</a>
<b>optional</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>): <i>Decoder&lt;T |
undefined&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/optional.js 'Source')

Accepts only the literal value `undefined`, or whatever the given decoder accepts.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(optional(string));

// 👍
verify('hello') === 'hello';
verify(undefined) === undefined;

// 👎
verify(null);  // throws
verify(0);     // throws
verify(42);    // throws
```
<!-- prettier-ignore-end -->

A typical case where `optional` is useful is in decoding objects with optional fields:

```javascript
object({
    id: number,
    name: string,
    address: optional(string),
});
```

Which will decode to type:

```javascript
{
  id: number,
  name: string,
  address?: string,
}
```

---

<a name="nullable" href="#nullable">#</a>
<b>nullable</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>): <i>Decoder&lt;T | null&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/optional.js 'Source')

Accepts only the literal value `null`, or whatever the given decoder accepts.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(nullable(string));

// 👍
verify('hello') === 'hello';
verify(null) === null;

// 👎
verify(undefined);  // throws
verify(0);          // throws
verify(42);         // throws
```
<!-- prettier-ignore-end -->

---

<a name="maybe" href="#maybe">#</a> <b>maybe</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>):
<i>Decoder&lt;?T&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/optional.js 'Source')

Accepts only `undefined`, `null`, or whatever the given decoder accepts.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(maybe(string));

// 👍
verify('hello') === 'hello';
verify(null) === null;
verify(undefined) === undefined;

// 👎
verify(0);   // throws
verify(42);  // throws
```
<!-- prettier-ignore-end -->

---

<a name="unknown" href="#unknown">#</a> <b>unknown</b>: <i>Decoder&lt;unknown&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/constants.js 'Source')<br />
<a name="mixed" href="#mixed">#</a> <b>mixed</b>: <i>Decoder&lt;mixed&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/constants.js 'Source')<br />

Accepts any value and returns it unchanged. Useful for situation in which you don't know
or expect a specific type. Of course, the downside is that you won't know the type of the
value statically and you'll have to further refine it yourself.

```javascript
const verify = guard(mixed);

// 👍
verify('hello') === 'hello';
verify(false) === false;
verify(undefined) === undefined;
verify([1, 2]) === [1, 2];

// 👎
// This decoder will never reject an input
```
