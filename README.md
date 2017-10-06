[![Build Status](https://travis-ci.org/nvie/decoders.svg?branch=master)](https://travis-ci.org/nvie/decoders)

Elm-like decoders for use with Flow in JS.

See http://elmplayground.com/decoding-json-in-elm-1 for an introduction.

## Why?

All data coming from outside your nice and cozy typed app is essentially of
unknown shape and form.  Think about your typical JSON responses.  For example,
if you have the following JSON response, parsed and returned from
`JSON.parse(payload)`:

```javascript
{
  points: [
    { x: 1, y: 2 },
    { x: 3, y: 4 },
  ],
}
```

You can likely guess what the type of this structure is.  You may have even
defined a type for it!

```javascript
type Point = { x: number, y: number };

type Payload = {
  points: Array<Point>,
};
```

But the problem is that Flow **does not have a runtime presence**, so it cannot
possibly inspect the _value_ of the payload while running it statically.  In
other words, Flow is unable to guess the type of the return value of
`JSON.parse(payload)`.  After all, what if your HTTP endpoint returned any of these instead:

```javascript
// Malformed content
{
  points: [
    { y: 2 },  // no "x"
    { x: 3, y: '4' },  // y is a string, not a number
  ],
}

// No data at all
{ points: null }

// Vastly different output than expected
{ error: "Oops, something happened" }
```

Of course, you can trick it into believing it actually received a Payload,
always, but who are you kidding?

```javascript
const data = ((JSON.parse(payload): any): Payload);  // Don't try this at home
```

The only way to ensure we can rely on Flow's type checking benefits to match
our runtime behaviour is to make sure we **verify** that the expected types
match our values at runtime!

Elm's solution to this problem is to define composable decoders: functions that
take anything and either fail with an error, or guarantee to return the
expected type.  This is exactly what the `decoders` package does: it offers
composable decoders (think verifiers, if that helps) that help you verify your
runtime data to match your expected Flow types.


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
 
