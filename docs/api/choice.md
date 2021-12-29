---
title: Choices
parent: API Reference
nav_order: 10
---

# Either

## Table of Contents

-   [`either`](#either)
-   [`disjointUnion`](#disjointUnion)
-   [`oneOf`](#oneOf)

---

<a name="either" href="#either">#</a> <b>either</b><i>&lt;A, B, C,
...&gt;</i>(<i>Decoder&lt;A&gt;</i>, <i>Decoder&lt;B&gt;</i>, <i>Decoder&lt;C&gt;</i>,
...): <i>Decoder&lt;A | B | C | ...&gt;</i><br />
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/either.js 'Source')<br />

Accepts any value that is accepted by any of the given decoders. The decoders are
attempted on the input in given order. The first one that accepts the input "wins".

<!-- prettier-ignore-start -->
```javascript
const verify = guard(either(number, string));

// 👍
verify('hello world') === 'hello world';
verify(123) === 123;

// 👎
verify(false);  // throws
```
<!-- prettier-ignore-end -->

**NOTE to Flow users:** In Flow, there is a max of 16 arguments with this construct. (This
is no problem in TypeScript.) If you hit the 16 argument limit, you can work around that
by stacking, e.g. do `either(<15 arguments here>, either(...))`.

---

<a name="disjointUnion" href="#disjointUnion">#</a> <b>disjointUnion</b><i>&lt;O: {
[field: string]: (Decoder&lt;T&gt; | Decoder&lt;V&gt; | ...) }&gt;</i>(field: string,
mapping: O): <i>Decoder&lt;T | V | ...&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/dispatch.js 'Source')

**NOTE:** In decoders@1.x, this was called `dispatch()`.

Like `either`, but only for building unions of object types with a common field (like a
`type` field) that lets you distinguish members.

The following two decoders are effectively equivalent:

```javascript
type Rect = { __type: 'rect', x: number, y: number, width: number, height: number };
type Circle = { __type: 'circle', cx: number, cy: number, r: number };
//              ^^^^^^
//              Field that defines which decoder to pick
//                                               vvvvvv
const shape1: Decoder<Rect | Circle> = disjointUnion('__type', { rect, circle });
const shape2: Decoder<Rect | Circle> = either(rect, circle);
```

But using `disjointUnion()` will typically be more runtime-efficient than using
`either()`. The reason is that `disjointUnion()` will first do minimal work to "look
ahead" into the `type` field here, and based on that value, pick which decoder to invoke.
Error messages will then also be tailored to the specific decoder.

The `either()` version will instead try each decoder in turn until it finds one that
matches. If none of the alternatives match, it needs to report all errors, which is
sometimes confusing.

---

<a name="oneOf" href="#oneOf">#</a> <b>oneOf</b><i>&lt;T&gt;</i>(<i>Array&lt;T&gt;</i>):
<i>Decoder&lt;T&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/either.js 'Source')<br />

Accepts any value that is strictly-equal (using `===`) to one of the specified values.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(oneOf(['foo', 'bar', 3]));

// 👍
verify('foo') === 'foo';
verify(3) === 3;

// 👎
verify('hello');  // throws
verify(4);        // throws
verify(false);    // throws
```
<!-- prettier-ignore-end -->

For example, given an array of strings, like so:

```javascript
oneOf(['foo', 'bar']);
```

TypeScript is capable of inferring the return type as `Decoder<'foo' | 'bar'>`, but in
Flow it will (unfortunately) be `Decoder<string>`. So in Flow, be sure to explicitly
annotate the type. Either by doing `oneOf([('foo': 'foo'), ('bar': 'bar')])`, or as
`oneOf<'foo' | 'bar'>(['foo', 'bar'])`.
