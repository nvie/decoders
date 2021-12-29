---
title: Utilities
parent: API Reference
nav_order: 12
---

# Utilities

## Table of Contents

-   [`fail`](#fail)
-   [`instanceOf`](#instanceOf)
-   [`prep`](#prep)
-   [`describe`](#describe)
-   [`lazy`](#lazy)

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

<a name="instanceOf" href="#instanceOf">#</a>
<b>instanceOf</b><i>&lt;T&gt;</i>(<i>Class&lt;T&gt;</i>): <i>Decoder&lt;T&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/instanceOf.js 'Source')<br />

Accepts any value that is an `instanceof` the given class.

> **NOTE: Help wanted!** The TypeScript annotation for this decoder needs help! If you
> know how to express it, please submit a PR. See
> https://github.com/nvie/decoders/blob/main/src/core/instanceOf.d.ts

<!-- prettier-ignore-start -->
```javascript
const verify = guard(instanceOf(Error));

// 👍
const value = new Error('foo');
verify(value) === value;

// 👎
verify('foo');  // throws
verify(3);      // throws
```
<!-- prettier-ignore-end -->

---

<a name="prep" href="#prep">#</a> <b>prep</b><i>&lt;T, I&gt;</i>(<i>unknown => I</i>,
<i>Decoder&lt;T, I&gt;</i>): <i>Decoder&lt;T&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/composition.js 'Source')<br />

Pre-process the raw data input before passing it into the decoder. This gives you the
ability to arbitrarily customize the input on the fly before passing it to the decoder. Of
course, the input value at that point is still of `unknown` type, so you will have to deal
with that accordingly.

<!-- prettier-ignore-start -->
```typescript
const verify = prep(
  // Will convert any input to an int first, before feeding it to
  // positiveInteger. This will effectively also allow numeric strings
  // to be accepted (and returned) as integers. If this ever throws,
  // then the error message will be what gets annotated on the input.
  x => parseInt(x),
  positiveInteger,
);

// 👍
verify(42) === 42;
verify('3') === 3;

// 👎
verify('-3');  // throws: not a positive number
verify('hi');  // throws: not a number
```
<!-- prettier-ignore-end -->

---

<a name="describe" href="#describe">#</a>
<b>describe</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>, <i>string</i>):
<i>Decoder&lt;T&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/describe.js 'Source')<br />

Uses the given decoder, but will use an alternative error message in case it rejects. This
can be used to simplify or shorten otherwise long or low-level/technical errors.

```javascript
const vowel = describe(
    either5(constant('a'), constant('e'), constant('i'), constant('o'), constant('u')),
    'Must be vowel',
);
```

---

<a name="lazy" href="#lazy">#</a> <b>lazy</b><i>&lt;T&gt;</i>(() =>
<i>Decoder&lt;T&gt;</i>): <i>Decoder&lt;T&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/lazy.js 'Source')<br />

Lazily evaluate the given decoder. This is useful to build self-referential types for
recursive data structures. Example:

```js
type Tree = {
    value: string,
    children: Array<Tree>,
    //              ^^^^
    //              Self-reference defining a recursive type
};

const treeDecoder: Decoder<Tree> = object({
    value: string,
    children: array(lazy(() => treeDecoder)),
    //              ^^^^^^^^^^^^^^^^^^^^^^^
    //              Use lazy() like this to refer to the treeDecoder which is
    //              getting defined here
});
```
