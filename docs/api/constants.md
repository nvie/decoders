---
title: Constants
nav_order: 5
---

### Constants

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

<a name="constant" href="#constant">#</a> <b>constant</b><i>&lt;T&gt;</i>(value: T):
<i>Decoder&lt;T&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/constants.js 'Source')

Accepts only the given constant value.

For TypeScript, use this syntax:

```typescript
constant('something' as const);
constant(42 as const);
```

For Flow, use this syntax:

```javascript
constant(('something': 'something'));
constant((42: 42));
```

Example:

<!-- prettier-ignore-start -->
```typescript
const verify = guard(constant('hello' as const));

// 👍
verify('hello') === 'hello';

// 👎
verify('this breaks');  // throws
verify(false);          // throws
verify(undefined);      // throws
```
<!-- prettier-ignore-end -->

---

<a name="hardcoded" href="#hardcoded">#</a> <b>hardcoded</b><i>&lt;T&gt;</i>(value: T):
<i>Decoder&lt;T&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/constants.js 'Source')

Accepts any input, completely ignores it, and always returns the provided value. This is
useful to manually add extra fields to object decoders.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(hardcoded(42));

// 👍
verify('hello') === 42;
verify(false) === 42;
verify(undefined) === 42;

// 👎
// This decoder will never reject an input
```
<!-- prettier-ignore-end -->

---

<a name="fail" href="#fail">#</a> <b>fail</b>(): <i>Decoder&lt;empty&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/fail.js 'Source')

Rejects all inputs, and always fails with the given error message. May be useful for
explicitly disallowing keys, or for testing purposes.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(object({
  a: string,
  b: optional(fail('Key b has been removed')),
}));

// 👍
verify({ a: 'foo' });            // ≈ { a: 'foo' };
verify({ a: 'foo', c: 'bar' });  // ≈ { a: 'foo' };

// 👎
verify({ a: 'foo', b: 'bar' });  // throws
```
<!-- prettier-ignore-end -->

---

<a name="unknown" href="#unknown">#</a> <b>unknown</b>: <i>Decoder&lt;unknown&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/constants.js 'Source')
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
