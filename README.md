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
const point = object({
    x: number,
    y: number,
});

const payload = object({
    points: array(point),
});

const payloadDecoder = decoder(payload);
```

And then, you can use it to decode values:

```javascript
>>> payloadDecoder(1)      // throws!
>>> payloadDecoder('foo')  // throws!
>>> payloadDecoder({       // OK!
...     points: [
...         { x: 1, y: 2 },
...         { x: 3, y: 4 },
...     ],
... })                     
```


## How do I use it?

Take the payloads example above.  In order to "convert" the output of 

```javascript
const untyped: mixed = JSON.parse('{"points": [{"x": 1, "y": 2}, {"x": 3, "y": 4}]}');
const typed: Payload = decodePayload(untyped);
```

Either `decodePayload()` will throw an error at runtime, or the output will be
guaranteed to be a valid `Payload` object.  How do we build the `decodePayload`
decoder?  By composing it out of prefab building blocks!

First, build a `Point` decoder!  It'll be a building block:

```javascript
const decodePoint = decodeObject({
    x: decodeNumber(),
    y: decodeNumber(),
});
```

Next, use it to define the `Payload` decoder:

```javascript
const decodePayload = decodeObject({
    points: decodeArray(decodePoint);
});
```

Notice how the result of this is a `Decoder<Payload>` type:

```javascript
(decodePayload: Decoder<Payload>);
```

A `Decoder<T>` is a verifier _function_ that, when called with an arbitrary
value will verify that that value actually matches the desired type, or throw
a runtime error:

```javascript
type Decoder<T> = (value: any) => T;
```

## API

The decoders package consists of a few building blocks:

* [Primivites](#primitives)
* [Compositions](#compositions)


### Primitives

<a name="decodeNumber" href="#decodeNumber">#</a> <b>decodeNumber</b>(): <i>Decoder&lt;number&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/number.js "Source")

Returns a decoder capable of decoding finite (!) numbers (integer or float
values).  This means that values like `NaN`, or positive and negative
`Infinity` are not considered valid numbers.

```javascript
const mydecoder = decodeNumber();
mydecoder(123) === 123
mydecoder(-3.14) === -3.14
mydecoder(NaN)             // DecodeError
mydecoder('not a number')  // DecodeError
```


---

<a name="decodeString" href="#decodeString">#</a> <b>decodeString</b>(): <i>Decoder&lt;string&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/string.js "Source")

Returns a decoder capable of decoding string values.

```javascript
const mydecoder = decodeString();
mydecoder('hello world') === 'hello world'
mydecoder(123)             // DecodeError
```


---

<a name="decodeBoolean" href="#decodeBoolean">#</a> <b>decodeBoolean</b>(): <i>Decoder&lt;boolean&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/string.js "Source")

Returns a decoder capable of decoding boolean values.

```javascript
const mydecoder = decodeBoolean();
mydecoder(false) === false
mydecoder(true) === true
mydecoder(undefined)       // DecodeError
mydecoder('hello world')   // DecodeError
mydecoder(123)             // DecodeError
```


---

<a name="decodeNull" href="#decodeNull">#</a> <b>decodeNull</b>(): <i>Decoder&lt;null&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/constants.js "Source")

Returns a decoder capable of decoding the constant value `null`.

```javascript
const mydecoder = decodeNull();
mydecoder(null) === null
mydecoder(false)           // DecodeError
mydecoder(undefined)       // DecodeError
mydecoder('hello world')   // DecodeError
```


---

<a name="decodeUndefined" href="#decodeUndefined">#</a> <b>decodeUndefined</b>(): <i>Decoder&lt;void&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/constants.js "Source")

Returns a decoder capable of decoding the constant value `undefined`.

```javascript
const mydecoder = decodeUndefined();
mydecoder(undefined) === undefined
mydecoder(null)            // DecodeError
mydecoder(false)           // DecodeError
mydecoder('hello world')   // DecodeError
```


---

<a name="decodeConstant" href="#decodeConstant">#</a> <b>decodeConstant</b><i>&lt;T&gt;</i>(value: T): <i>Decoder&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/constants.js "Source")

Returns a decoder capable of decoding just the given constant value.

```javascript
const mydecoder = decodeConstant('hello');
mydecoder('hello') === 'hello'
mydecoder('this breaks')   // DecodeError
mydecoder(false)           // DecodeError
mydecoder(undefined)       // DecodeError
```


---

<a name="decodeValue" href="#decodeValue">#</a> <b>decodeValue</b><i>&lt;T&gt;</i>(value: T): <i>Decoder&lt;T&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/constants.js "Source")

Returns a decoder that will always return the provided value **without looking
at the input**.  This is useful to manually add extra fields.

```javascript
const mydecoder = decodeValue(2.1);
mydecoder('hello') === 2.1
mydecoder(false) === 2.1
mydecoder(undefined) === 2.1
```


### Compositions

Composite decoders are "higher order" decoders that can build new decoders from
existing decoders that can already decode a "subtype".  Examples are: if you
already have a decoder for a `Point` (= `Decoder<Point>`), then you can use
`decodeArray()` to automatically build a decoder for arrays of points:
`decodeArray(pointDecoder)`, which will be of type `Decoder<Array<Point>>`.


<a name="decodeArray" href="#decodeArray">#</a> <b>decodeArray</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>): <i>Decoder&lt;Array&lt;T&gt;&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/array.js "Source")

Returns a decoder capable of decoding **an array of <i>T</i>'s**, provided that
you already have a decoder for <i>T</i>.

```javascript
const mydecoder = decodeArray(decodeString());
mydecoder(['hello', 'world']) === ['hello', 'world']
mydecoder(['hello', 1.2])  // DecodeError
```


---


<a name="decodeTuple2" href="#decodeTuple2">#</a> <b>decodeTuple2</b><i>&lt;T1, T2&gt;</i>(<i>Decoder&lt;T1&gt;</i>, <i>Decoder&lt;T2&gt;</i>): <i>Decoder&lt;[T1, T2]&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/tuple.js "Source")<br />
<a name="decodeTuple3" href="#decodeTuple3">#</a> <b>decodeTuple3</b><i>&lt;T1, T2, T3&gt;</i>(<i>Decoder&lt;T1&gt;</i>, <i>Decoder&lt;T2&gt;</i>, <i>Decoder&lt;T3&gt;</i>): <i>Decoder&lt;[T1, T2, T3]&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/tuple.js "Source")

Returns a decoder capable of decoding **a 2-tuple of <i>(T1, T2)</i>'s**,
provided that you already have a decoder for <i>T1</i> and <i>T2</i>.  A tuple
is like an Array, but the number of items in the array is fixed (two) and their
types don't have to be homogeneous.

```javascript
const mydecoder = decodeTuple2(decodeString(), decodeNumber());
mydecoder(['hello', 1.2]) === ['hello', 1.2]
mydecoder(['hello', 'world'])  // DecodeError
```


---


<a name="decodeObject" href="#decodeObject">#</a> <b>decodeObject</b><i>&lt;O: { [field: string]: Decoder&lt;any&gt; }&gt;</i>(mapping: O): <i>Decoder&lt;{ ... }&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/object.js "Source")

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
const mydecoder = decodeObject({
    x: decodeNumber(),
    y: decodeNumber(),
});
mydecoder({ x: 1, y: 2 }) === { x: 1, y: 2 };
mydecoder({ x: 1, y: 2, z: 3 }) === { x: 1, y: 2 };  // ⚠️
mydecoder({ x: 1 })  // DecodeError (missing field y)
```


---

<a name="decodeMap" href="#decodeMap">#</a> <b>decodeMap</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>): <i>Decoder&lt;Map&lt;string, T&gt;&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/map.js "Source")

Returns a decoder capable of decoding **Map instances of strings-to-T's**
, provided that you already have a decoder for <i>T</i>.

The main difference between `decodeObject()` and `decodeMap()` is that you'd
typically use `decodeObject()` if this is a record-like object, where you know
all the field names and the values are heterogeneous.  Whereas with Mappings
the keys are typically unknown and the values homogeneous.


```javascript
const mydecoder = decodeMapping(decodePerson());
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


<a name="oneOf" href="#oneOf">#</a> <b>oneOf</b><i>&lt;T1, T2&gt;</i>(<i>Decoder&lt;T1&gt;</i>, <i>Decoder&lt;T2&gt;</i>): <i>Decoder&lt;T1 | T2&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/oneOf.js "Source")<br />
<a name="oneOf2" href="#oneOf2">#</a> <b>oneOf2</b><i>&lt;T1, T2&gt;</i>(<i>Decoder&lt;T1&gt;</i>, <i>Decoder&lt;T2&gt;</i>): <i>Decoder&lt;T1 | T2&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/oneOf.js "Source")<br />
<a name="oneOf3" href="#oneOf3">#</a> <b>oneOf3</b><i>&lt;T1, T2, T3&gt;</i>(<i>Decoder&lt;T1&gt;</i>, <i>Decoder&lt;T2&gt;</i>, <i>Decoder&lt;T3&gt;</i>): <i>Decoder&lt;T1 | T2 | T3&gt;</i> [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/oneOf.js "Source")
...

Returns a decoder capable of decoding **either one of <i>T1</i> or <i>T2</i>**,
provided that you already have decoders for <i>T1</i> and <i>T2</i>.

```javascript
const mydecoder = oneOf(decodeNumber(), decodeString());
mydecoder('hello world') === 'hello world';
mydecoder(123) === 123;
mydecoder(false)     // DecodeError
```
 
