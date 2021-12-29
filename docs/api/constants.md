---
title: Constants
parent: API Reference
nav_order: 5
---

# Constants

## Table of Contents

-   [`constant`](#constant)
-   [`hardcoded`](#hardcoded)

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
