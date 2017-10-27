[![npm](https://img.shields.io/npm/v/decoders.svg)](https://www.npmjs.com/package/decoders)
[![Build Status](https://img.shields.io/travis/nvie/decoders/master.svg)](https://travis-ci.org/nvie/decoders)
[![Coverage Status](https://img.shields.io/coveralls/nvie/decoders/master.svg)](https://coveralls.io/github/nvie/decoders?branch=master)

Elm-like decoders for use with Flow in JS.

See http://elmplayground.com/decoding-json-in-elm-1 for an introduction.

## Why?

If you're using Flow to statically typecheck your JavaScript, you'll know that
any JSON data coming from the outside is essentially free-form and untyped.  In
order to validate and enforce the correct shape of that data, you'll need
"decoders".

For example, imagine your app expects a list of points in a JSON response:

```javascript
{
  points: [
    { x: 1, y: 2 },
    { x: 3, y: 4 },
  ],
}
```

In order to decode this, you'll have to tell Flow about the expected structure,
and use the decoders to validate at runtime that the free-form data will be in
the expected shape.

```javascript
type Point = { x: number, y: number };

type Payload = {
  points: Array<Point>,
};
```

Here's a decoder that will work for this type:

```javascript
import { guard, number, object } from 'decoders';

const point = object({
    x: number,
    y: number,
});

const payload = object({
    points: array(point),
});

const payloadGuard = guard(payload);
```

And then, you can use it to decode values:

```javascript
>>> payloadGuard(1)      // throws!
>>> payloadGuard('foo')  // throws!
>>> payloadGuard({       // OK!
...     points: [
...         { x: 1, y: 2 },
...         { x: 3, y: 4 },
...     ],
... })                     
```


## API

The decoders package consists of a few building blocks:

* [Primivites](#primitives)
* [Compositions](#compositions)


### Primitives

<a name="number" href="#number">#</a> <b>number</b>(): <i>Decoder&lt;number&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/number.js "Source")

Returns a decoder capable of decoding finite (!) numbers (integer or float
values).  This means that values like `NaN`, or positive and negative
`Infinity` are not considered valid numbers.

```javascript
const mydecoder = guard(number);
mydecoder(123) === 123
mydecoder(-3.14) === -3.14
mydecoder(NaN)             // DecodeError
mydecoder('not a number')  // DecodeError
```


---

<a name="string" href="#string">#</a> <b>string</b>(): <i>Decoder&lt;string&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/string.js "Source")

Returns a decoder capable of decoding string values.

```javascript
const mydecoder = guard(string);
mydecoder('hello world') === 'hello world'
mydecoder(123)             // DecodeError
```


---

<a name="boolean" href="#boolean">#</a> <b>boolean</b>(): <i>Decoder&lt;boolean&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/string.js "Source")

Returns a decoder capable of decoding boolean values.

```javascript
const mydecoder = guard(boolean);
mydecoder(false) === false
mydecoder(true) === true
mydecoder(undefined)       // DecodeError
mydecoder('hello world')   // DecodeError
mydecoder(123)             // DecodeError
```


---

<a name="null_" href="#null_">#</a> <b>null_</b>(): <i>Decoder&lt;null&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/constants.js "Source")

Returns a decoder capable of decoding the constant value `null`.

```javascript
const mydecoder = guard(null_);
mydecoder(null) === null
mydecoder(false)           // DecodeError
mydecoder(undefined)       // DecodeError
mydecoder('hello world')   // DecodeError
```


---

<a name="undefined_" href="#undefined_">#</a> <b>undefined_</b>(): <i>Decoder&lt;void&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/constants.js "Source")

Returns a decoder capable of decoding the constant value `undefined`.

```javascript
const mydecoder = guard(undefined_);
mydecoder(undefined) === undefined
mydecoder(null)            // DecodeError
mydecoder(false)           // DecodeError
mydecoder('hello world')   // DecodeError
```


---

<a name="constant" href="#constant">#</a> <b>constant</b><i>&lt;T&gt;</i>(value: T): <i>Decoder&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/constants.js "Source")

Returns a decoder capable of decoding just the given constant value.

```javascript
const mydecoder = guard(constant('hello'));
mydecoder('hello') === 'hello'
mydecoder('this breaks')   // DecodeError
mydecoder(false)           // DecodeError
mydecoder(undefined)       // DecodeError
```


---

<a name="hardcoded" href="#hardcoded">#</a> <b>hardcoded</b><i>&lt;T&gt;</i>(value: T): <i>Decoder&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/constants.js "Source")

Returns a decoder that will always return the provided value **without looking
at the input**.  This is useful to manually add extra fields.

```javascript
const mydecoder = guard(hardcoded(2.1));
mydecoder('hello') === 2.1
mydecoder(false) === 2.1
mydecoder(undefined) === 2.1
```


### Compositions

Composite decoders are "higher order" decoders that can build new decoders from
existing decoders that can already decode a "subtype".  Examples are: if you
already have a decoder for a `Point` (= `Decoder<Point>`), then you can use
`array()` to automatically build a decoder for arrays of points:
`array(pointDecoder)`, which will be of type `Decoder<Array<Point>>`.


<a name="array" href="#array">#</a> <b>array</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>): <i>Decoder&lt;Array&lt;T&gt;&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/array.js "Source")

Returns a decoder capable of decoding **an array of <i>T</i>'s**, provided that
you already have a decoder for <i>T</i>.

```javascript
const mydecoder = guard(array(string));
mydecoder(['hello', 'world']) === ['hello', 'world']
mydecoder(['hello', 1.2])  // DecodeError
```


---


<a name="tuple2" href="#tuple2">#</a> <b>tuple2</b><i>&lt;T1, T2&gt;</i>(<i>Decoder&lt;T1&gt;</i>, <i>Decoder&lt;T2&gt;</i>): <i>Decoder&lt;[T1, T2]&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/tuple.js "Source")<br />
<a name="tuple3" href="#tuple3">#</a> <b>tuple3</b><i>&lt;T1, T2, T3&gt;</i>(<i>Decoder&lt;T1&gt;</i>, <i>Decoder&lt;T2&gt;</i>, <i>Decoder&lt;T3&gt;</i>): <i>Decoder&lt;[T1, T2, T3]&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/tuple.js "Source")

Returns a decoder capable of decoding **a 2-tuple of <i>(T1, T2)</i>'s**,
provided that you already have a decoder for <i>T1</i> and <i>T2</i>.  A tuple
is like an Array, but the number of items in the array is fixed (two) and their
types don't have to be homogeneous.

```javascript
const mydecoder = guard(tuple2(string, number));
mydecoder(['hello', 1.2]) === ['hello', 1.2]
mydecoder(['hello', 'world'])  // DecodeError
```


---


<a name="object" href="#object">#</a> <b>object</b><i>&lt;O: { [field: string]: Decoder&lt;any&gt; }&gt;</i>(mapping: O): <i>Decoder&lt;{ ... }&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/object.js "Source")

Returns a decoder capable of decoding **objects of the given shape**
corresponding decoders, provided that you already have decoders for all values
in the mapping.

> **NOTE:**
> 🙀 OMG, that type signature!  **Don't panic.**  Here's what it says with an
> example.  Given this mapping of field-to-decoder instances:
> 
>     {
>       name: Decoder<string>,
>       age: Decoder<number>,
>     }
> 
> compose a decoder of this type: `Decoder<{ name: string, age: number }>`.

```javascript
const mydecoder = guard(object({
    x: number,
    y: number,
}));
mydecoder({ x: 1, y: 2 }) === { x: 1, y: 2 };
mydecoder({ x: 1, y: 2, z: 3 }) === { x: 1, y: 2 };  // ⚠️
mydecoder({ x: 1 })  // DecodeError (missing field y)
```


---

<a name="mapping" href="#mapping">#</a> <b>mapping</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>): <i>Decoder&lt;Map&lt;string, T&gt;&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/map.js "Source")

Returns a decoder capable of decoding **Map instances of strings-to-T's**
, provided that you already have a decoder for <i>T</i>.

The main difference between `object()` and `mapping()` is that you'd typically
use `object()` if this is a record-like object, where you know all the field
names and the values are heterogeneous.  Whereas with Mappings the keys are
typically unknown and the values homogeneous.


```javascript
const mydecoder = guard(mapping(person));  // Assume you have a "person" decoder already
mydecoder({
    "1": { name: "Alice" },
    "2": { name: "Bob" },
    "3": { name: "Charlie" },
}) === Map([
    ['1', { name: "Alice" }],
    ['2', { name: "Bob" }],
    ['3', { name: "Charlie" }],
])
```


---


<a name="either" href="#either">#</a> <b>either</b><i>&lt;T1, T2&gt;</i>(<i>Decoder&lt;T1&gt;</i>, <i>Decoder&lt;T2&gt;</i>): <i>Decoder&lt;T1 | T2&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/either.js "Source")<br />
<a name="either2" href="#either2">#</a> <b>either2</b><i>&lt;T1, T2&gt;</i>(<i>Decoder&lt;T1&gt;</i>, <i>Decoder&lt;T2&gt;</i>): <i>Decoder&lt;T1 | T2&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/either.js "Source")<br />
<a name="either3" href="#either3">#</a> <b>either3</b><i>&lt;T1, T2, T3&gt;</i>(<i>Decoder&lt;T1&gt;</i>, <i>Decoder&lt;T2&gt;</i>, <i>Decoder&lt;T3&gt;</i>): <i>Decoder&lt;T1 | T2 | T3&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/either.js "Source")
...

Returns a decoder capable of decoding **either one of <i>T1</i> or <i>T2</i>**,
provided that you already have decoders for <i>T1</i> and <i>T2</i>.

```javascript
const mydecoder = guard(either(number, string));
mydecoder('hello world') === 'hello world';
mydecoder(123) === 123;
mydecoder(false)     // DecodeError
```
 
