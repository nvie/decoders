## decoders

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
