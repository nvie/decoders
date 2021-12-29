---
title: Booleans
parent: API Reference
nav_order: 3
---

### Booleans

<a name="boolean" href="#boolean">#</a> <b>boolean</b>: <i>Decoder&lt;boolean&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/boolean.js 'Source')

Accepts only boolean values.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(boolean);

// 👍
verify(false) === false;
verify(true) === true;

// 👎
verify(undefined);      // throws
verify('hello world');  // throws
verify(123);            // throws
```
<!-- prettier-ignore-end -->

---

<a name="truthy" href="#truthy">#</a> <b>truthy</b>: <i>Decoder&lt;boolean&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/boolean.js 'Source')

Accepts any value and will return its "truth" value. Will never reject.

```javascript
const verify = guard(truthy);

// 👍
verify(false) === false;
verify(true) === true;
verify(undefined) === false;
verify('hello world') === true;
verify('false') === true;
verify(0) === false;
verify(1) === true;
verify(null) === false;

// 👎
// This decoder will never reject an input
```

---

<a name="numericBoolean" href="#numericBoolean">#</a> <b>numericBoolean</b>:
<i>Decoder&lt;boolean&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/boolean.js 'Source')

Accepts only number values, but return their boolean representation.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(numericBoolean);

// 👍
verify(-1) === true;
verify(0) === false;
verify(123) === true;

// 👎
verify(false);      // throws
verify(true);       // throws
verify(undefined);  // throws
verify('hello');    // throws
```
<!-- prettier-ignore-end -->

---
