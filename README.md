[![Build Status](https://travis-ci.com/nvie/decoders.svg?token=aq9GGFeH6P9dKDFz65um&branch=master)](https://travis-ci.com/nvie/decoders)

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
const decodePoint = dec.object({
    x: dec.number(),
    y: dec.number(),
});
```

Next, use it to define the `Payload` decoder:

```javascript
const decodePayload = dec.object({
    points: dec.array(decodePoint);
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

## The API

The decoders package consists of a few building blocks:

* [Primivites](#primitives)
* [Compositions](#compositions)
* [Helpers](#helpers)


### Primitives

<a name="decodeNumber" href="#decodeNumber">#</a> <b>decodeNumber</b>() [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/number.js "Source")

Decodes a finite (!) number (integer or float) value.  Will throw
a `DecodeError` if anything other than a finite number value is found.  This
means that values like `NaN`, or positive and negative `Infinity` are not
considered valid numbers.

* `dec.string()`
* `dec.boolean()`
* `dec.null()`

* `dec.constant()`


### Compositions

Composite decoders are "higher order" decoders that can build new decoders from
existing decoders that can already decode a "subtype".  Examples are: if you
already have a decoder for a `Point` (= `Decoder<Point>`), then you can use
`dec.array()` to automatically build a decoder for arrays of points:
`dec.array(pointDecoder)`, which will be of type `Decoder<Array<Point>>`.

* `dec.array()`
* `dec.object()`

<a name="array" href="#array">#</a> dec.<b>array</b>(<i>decoder</i>: <i>Decoder&lt;T&gt;</i>) [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/array.js "Source")

Foo bar qux.


<a name="object" href="#object">#</a> dec.<b>object</b>(<i>decoder</i>: <i>Decoder&lt;XXX&gt;</i>) [&lt;&gt;](https://github.com/nvie/decoders/blob/master/src/object.js "Source")

Foo bar qux.


### Helpers

