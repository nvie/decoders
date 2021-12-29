---
title: Numbers
nav_order: 2
---

### Numbers

<a name="number" href="#number">#</a> <b>number</b>: <i>Decoder&lt;number&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/number.js 'Source')

Accepts only finite numbers (integer or float values). This means that values like `NaN`,
or positive and negative `Infinity` are not considered valid numbers.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(number);

// 👍
verify(123) === 123;
verify(-3.14) === -3.14;

// 👎
verify(Infinity);        // throws
verify(NaN);             // throws
verify('not a number');  // throws
```
<!-- prettier-ignore-end -->

---

<a name="integer" href="#integer">#</a> <b>integer</b>: <i>Decoder&lt;integer&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/number.js 'Source')

Like `number`, but only accepts values that are whole numbers.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(integer);

// 👍
verify(123) === 123;

// 👎
verify(-3.14);           // throws
verify(Infinity);        // throws
verify(NaN);             // throws
verify('not a integer'); // throws
```
<!-- prettier-ignore-end -->

---

<a name="positiveNumber" href="#positiveNumber">#</a> <b>positiveNumber</b>:
<i>Decoder&lt;number&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/number.js 'Source')

Accepts only positive finite numbers (integer or float values).

<!-- prettier-ignore-start -->
```javascript
const verify = guard(positiveNumber);

// 👍
verify(123) === 123;

// 👎
verify(-42);             // throws
verify(3.14);            // throws
verify(Infinity);        // throws
verify(NaN);             // throws
verify('not a number');  // throws
```
<!-- prettier-ignore-end -->

---

<a name="positiveInteger" href="#positiveInteger">#</a> <b>positiveInteger</b>:
<i>Decoder&lt;number&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/number.js 'Source')

Accepts only positive finite integers.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(positiveInteger);

// 👍
verify(123) === 123;

// 👎
verify(-3);              // throws
verify(3.14);            // throws
verify(Infinity);        // throws
verify(NaN);             // throws
verify('not a number');  // throws
```
<!-- prettier-ignore-end -->

---
