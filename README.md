<img alt="Decoders logo" src="./img/logo@2x.png" width="330" height="64" /><br />

[![npm](https://img.shields.io/npm/v/decoders.svg)](https://www.npmjs.com/package/decoders)
[![Build Status](https://github.com/nvie/decoders/workflows/test/badge.svg)](https://github.com/nvie/decoders/actions)
[![Coverage Status](https://img.shields.io/coveralls/nvie/decoders/main.svg)](https://coveralls.io/github/nvie/decoders?branch=main)
[![Minified Size](https://badgen.net/bundlephobia/minzip/decoders)](https://bundlephobia.com/result?p=decoders)

Elegant and battle-tested validation library for type-safe input data for TypeScript and
Flow. The API is inspired by Elm’s JSON decoders, hence the name.

See https://nvie.com/posts/introducing-decoders/ for an introduction.

## Why?

If you're using Flow or TypeScript to statically typecheck your JavaScript, you'll know
that any data coming from outside your program’s boundaries is essentially untyped and
unsafe. "Decoders" can help to validate and enforce the correct shape of that data.

For example, imagine your app expects a list of points in an incoming HTTP request:

```javascript
{
  points: [
    { x: 1, y: 2 },
    { x: 3, y: 4 },
  ],
}
```

In order to decode this, you'll have to tell Flow about the expected structure, and use
the decoders to validate at runtime that the free-form data will be in the expected shape.

```javascript
type Point = { x: number, y: number };

type Payload = {
    points: Array<Point>,
};
```

Here's a decoder that will work for this type:

```javascript
import { array, guard, number, object } from 'decoders';

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

## Understanding decoders and guards

At the heart, a decoder is a function that will take _any_ unsafe input, verify it, and
either return an "ok" or an annotated "err" result. It will never throw an error when
called.

A guard is a convenience wrapper which will use the decoder

## API

The decoders package consists of a few building blocks:

-   [Guards](#guards)
-   [Primitives](#primitives)
-   [Compositions](#compositions)
-   [Building custom decoders](#building-custom-decoders)

### Guards

<a name="guard" href="#guard">#</a> <b>guard</b>(decoder: <i>Decoder&lt;T&gt;</i>,
formatter?: <i>Annotation => string</i>): <i>Guard&lt;T&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/_guard.js 'Source')

Turns any given `Decoder<T>` into a `Guard<T>`.

A guard works like a decoder, but will either:

-   Return the decoded value (aka the happy path)
-   Or throw an exception

So a Guard bypasses the intermediate "Result" type that decoders output. An "ok" result
will get returned, an "err" result will be formatted into an error message and thrown.

The typical usage is that you keep composing decoders until you have one decoder for your
entire input object, and then use a guard to wrap that outer decoder. Decoders can be
composed to build larger decoders. Guards cannot be composed.

#### Formatting error messsages

By default, `guard()` will use the `formatInline` error formatter. You can pass another
built-in formatter as the second argument, or provide your own. (This will require
understanding the internal `Annotation` datastructure that decoders uses for error
reporting.)

Built-in formatters are:

-   `formatInline` (default) — will echo back the input object and inline error messages
    smartly. Example:

    ```typescript
    import { array, guard, object, string } from 'decoders';
    import { formatInline } from 'decoders/format';

    const mydecoder = array(object({ name: string, age: number }));

    const defaultGuard = guard(mydecoder, formatInline);
    defaultGuard([{ name: 'Alice', age: '33' }]);
    ```

    Will throw the following error message:

    ```text
    Decoding error:
    [
      {
        name: 'Alice',
        age: '33',
             ^^^^ Must be number
      },
    ]
    ```

-   `formatShort` — will report the _path_ into the object where the error happened.
    Example:

    ```typescript
    import { formatShort } from 'decoders/format';
    const customGuard = guard(mydecoder, formatShort);
    ```

    Will throw the following error message:

    ```text
    Decoding error: Value at keypath 0.age: Must be number
    ```

### Primitives

<a name="number" href="#number">#</a> <b>number</b>: <i>Decoder&lt;number&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/number.js 'Source')

Accepts only finite numbers (integer or float values). This means that values like `NaN`,
or positive and negative `Infinity` are not considered valid numbers.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(number);

// 👍
verify(123) === 123;
verify(-3.14) === -3.14;

// 👎
verify(Infinity);        // throws
verify(NaN);             // throws
verify('not a number');  // throws
```
<!-- prettier-ignore-end -->

---

<a name="integer" href="#integer">#</a> <b>integer</b>: <i>Decoder&lt;integer&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/number.js 'Source')

Like `number`, but only accepts values that are whole numbers.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(integer);

// 👍
verify(123) === 123;

// 👎
verify(-3.14);           // throws
verify(Infinity);        // throws
verify(NaN);             // throws
verify('not a integer'); // throws
```
<!-- prettier-ignore-end -->

---

<a name="positiveNumber" href="#positiveNumber">#</a> <b>positiveNumber</b>:
<i>Decoder&lt;number&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/number.js 'Source')

Accepts only positive finite numbers (integer or float values).

<!-- prettier-ignore-start -->
```javascript
const verify = guard(positiveNumber);

// 👍
verify(123) === 123;

// 👎
verify(-42);             // throws
verify(3.14);            // throws
verify(Infinity);        // throws
verify(NaN);             // throws
verify('not a number');  // throws
```
<!-- prettier-ignore-end -->

---

<a name="positiveInteger" href="#positiveInteger">#</a> <b>positiveInteger</b>:
<i>Decoder&lt;number&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/number.js 'Source')

Accepts only positive finite integers.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(positiveInteger);

// 👍
verify(123) === 123;

// 👎
verify(-3);              // throws
verify(3.14);            // throws
verify(Infinity);        // throws
verify(NaN);             // throws
verify('not a number');  // throws
```
<!-- prettier-ignore-end -->

---

<a name="string" href="#string">#</a> <b>string</b>: <i>Decoder&lt;string&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/string.js 'Source')

Accepts only string values.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(string);

// 👍
verify('hello world') === 'hello world';
verify('🚀') === '🚀';
verify('') === '';

// 👎
verify(123);   // throws
verify(true);  // throws
verify(null);  // throws
```
<!-- prettier-ignore-end -->

---

<a name="nonEmptyString" href="#nonEmptyString">#</a> <b>nonEmptyString</b>:
<i>Decoder&lt;string&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/string.js 'Source')

Like `string`, but will reject the empty string, or strings containing only whitespace.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(nonEmptyString);

// 👍
verify('hello world') === 'hello world';
verify('🚀') === '🚀';

// 👎
verify(123);   // throws
verify('  ');  // throws
verify('');    // throws
```
<!-- prettier-ignore-end -->

---

<a name="regex" href="#regex">#</a> <b>regex</b>(): <i>Decoder&lt;string&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/string.js 'Source')

Accepts only string values that match the given regular expression.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(regex(/^[0-9][0-9]+$/));

// 👍
verify('42') === '42';
verify('83401648364738') === '83401648364738';

// 👎
verify('');     // throws
verify('1');    // throws
verify('foo');  // throws
```
<!-- prettier-ignore-end -->

---

<a name="email" href="#email">#</a> <b>email</b>: <i>Decoder&lt;string&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/string.js 'Source')

Accepts only strings that are syntactically valid email addresses. (This will not mean
that the email address actually exist.)

<!-- prettier-ignore-start -->
```javascript
const verify = guard(email);

// 👍
verify('alice@acme.org') === 'alice@acme.org';

// 👎
verify('foo');               // throws
verify('@acme.org');         // throws
verify('alice @ acme.org');  // throws
```
<!-- prettier-ignore-end -->

---

<a name="url" href="#url">#</a> <b>url</b>: <i>Decoder&lt;URL&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/string.js 'Source')

Accepts strings that are valid URLs, returns the value as a URL instance.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(url);

// 👍
verify('http://nvie.com') === new URL('http://nvie.com/');
verify('https://nvie.com') === new URL('https://nvie.com/');
verify('git+ssh://user@github.com/foo/bar.git') === new URL('git+ssh://user@github.com/foo/bar.git');

// 👎
verify('foo');               // throws
verify('@acme.org');         // throws
verify('alice @ acme.org');  // throws
verify('/search?q=foo');     // throws
```
<!-- prettier-ignore-end -->

---

<a name="httpsUrl" href="#httpsUrl">#</a> <b>httpsUrl</b>: <i>Decoder&lt;URL&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/string.js 'Source')

Accepts strings that are valid URLs, but only HTTPS ones. Returns the value as a URL
instance.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(httpsUrl);

// 👍
verify('https://nvie.com:443') === new URL('https://nvie.com/');

// 👎
verify('http://nvie.com');                        // throws, not HTTPS
verify('git+ssh://user@github.com/foo/bar.git');  // throws, not HTTPS
```
<!-- prettier-ignore-end -->

**Tip!** If you need to limit URLs to different protocols than HTTP, you can do as the
HTTPS decoder is implemented: as a predicate on top of a regular `url` decoder.

```typescript
import { predicate, url } from 'decoders';

const gitUrl: Decoder<URL> = predicate(
    url,
    (value) => value.protocol === 'git:',
    'Must be a git:// URL',
);
```

---

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

<a name="date" href="#date">#</a> <b>date</b>: <i>Decoder&lt;Date&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/date.js 'Source')

Accepts only JavaScript [Date][date-api] values.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(date);
const now = new Date();

// 👍
verify(now) === now;

// 👎
verify(123);      // throws
verify('hello');  // throws
```
<!-- prettier-ignore-end -->

---

<a name="iso8601" href="#iso8601">#</a> <b>iso8601</b>: <i>Decoder&lt;Date&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/date.js 'Source')

Accepts only [ISO8601][iso8601-fmt]-formatted strings. This is very useful for working
with dates in APIs: serialize them as `.toISOString()` when sending, decode them with
`iso8601` when receiving.

**NOTE:** This decoder accepts _strings_, but returns _Date_ instances.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(iso8601);

// 👍
verify('2020-06-01T12:00:00Z'); // ≈ new Date('2020-06-01T12:00:00Z')

// 👎
verify('2020-06-01');  // throws
verify('hello');       // throws
verify(123);           // throws
verify(new Date());    // throws (does not accept dates)
```
<!-- prettier-ignore-end -->

---

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

### Compositions

Composite decoders can build new decoders from existing decoders that can already decode a
"subtype". Examples are: if you already have a `string` decoder (of type
`Decoder<string>`), then you can use `array(string)` to automatically build a decoder for
arrays of strings, which will be of type `Decoder<Array<string>>`.

<a name="optional" href="#optional">#</a>
<b>optional</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>): <i>Decoder&lt;T |
undefined&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/optional.js 'Source')

Accepts only the literal value `undefined`, or whatever the given decoder accepts.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(optional(string));

// 👍
verify('hello') === 'hello';
verify(undefined) === undefined;

// 👎
verify(null);  // throws
verify(0);     // throws
verify(42);    // throws
```
<!-- prettier-ignore-end -->

A typical case where `optional` is useful is in decoding objects with optional fields:

```javascript
object({
    id: number,
    name: string,
    address: optional(string),
});
```

Which will decode to type:

```javascript
{
  id: number,
  name: string,
  address?: string,
}
```

---

<a name="nullable" href="#nullable">#</a>
<b>nullable</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>): <i>Decoder&lt;T | null&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/optional.js 'Source')

Accepts only the literal value `null`, or whatever the given decoder accepts.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(nullable(string));

// 👍
verify('hello') === 'hello';
verify(null) === null;

// 👎
verify(undefined);  // throws
verify(0);          // throws
verify(42);         // throws
```
<!-- prettier-ignore-end -->

---

<a name="maybe" href="#maybe">#</a> <b>maybe</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>):
<i>Decoder&lt;?T&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/optional.js 'Source')

Accepts only `undefined`, `null`, or whatever the given decoder accepts.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(maybe(string));

// 👍
verify('hello') === 'hello';
verify(null) === null;
verify(undefined) === undefined;

// 👎
verify(0);   // throws
verify(42);  // throws
```
<!-- prettier-ignore-end -->

---

<a name="array" href="#array">#</a> <b>array</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>):
<i>Decoder&lt;Array&lt;T&gt;&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/array.js 'Source')

Accepts only arrays of whatever the given decoder accepts.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(array(string));

// 👍
verify(['hello', 'world']) === ['hello', 'world'];

// 👎
verify(['hello', 1.2]);  // throws
```
<!-- prettier-ignore-end -->

---

<a name="nonEmptyArray" href="#nonEmptyArray">#</a>
<b>nonEmptyArray</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>):
<i>Decoder&lt;Array&lt;T&gt;&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/array.js 'Source')

Like `array()`, but will reject arrays with 0 elements.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(nonEmptyArray(string));

// 👍
verify(['hello', 'world']) === ['hello', 'world'];

// 👎
verify(['hello', 1.2]);  // throws
verify([]);              // throws
```
<!-- prettier-ignore-end -->

---

<a name="poja" href="#poja">#</a> <b>poja</b>: <i>Decoder&lt;Array&lt;unknown&gt;&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/array.js 'Source')

Accepts any array, but doesn't validate its items further.

"poja" means "plain old JavaScript array", a play on ["pojo"](#pojo).

<!-- prettier-ignore-start -->
```javascript
const verify = guard(poja);

// 👍
verify([1, 'hi', true]) === [1, 'hi', true];
verify(['hello', 'world']) === ['hello', 'world'];
verify([]) === [];

// 👎
verify({});    // throws
verify('hi');  // throws
```
<!-- prettier-ignore-end -->

---

<a name="tuple" href="#tuple">#</a> <b>tuple</b><i>&lt;A, B, C,
...&gt;</i>(<i>Decoder&lt;A&gt;</i>, <i>Decoder&lt;B&gt;</i>, <i>Decoder&lt;C&gt;</i>):
<i>Decoder&lt;[A, B, C, ...]&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/tuple.js 'Source')

Accepts a tuple (an array with exactly _n_ items) of values accepted by the _n_ given
decoders.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(tuple(string, number));

// 👍
verify(['hello', 1.2]) === ['hello', 1.2];

// 👎
verify([]);                  // throws, too few items
verify(['hello', 'world']);  // throws, not the right types
verify(['a', 1, 'c']);       // throws, too many items
```
<!-- prettier-ignore-end -->

---

<a name="set" href="#set">#</a> <b>set</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>):
<i>Decoder&lt;Set&lt;T&gt;&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/array.js 'Source')

Similar to [`array`](#array), but returns the result as an ES6 Set.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(set(string));

// 👍
verify(['hello', 'world'])  // ≈ new Set(['hello', 'world']);

// 👎
verify(['hello', 1.2]);     // throws
```
<!-- prettier-ignore-end -->

---

<a name="object" href="#object">#</a> <b>object</b><i>&lt;O: { [field: string]:
Decoder&lt;any&gt; }&gt;</i>(mapping: O): <i>Decoder&lt;{ ... }&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/object.js 'Source')

Accepts object values with fields matching the given decoders. Extra fields that exist on
the input object are ignored and will not be returned.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(
    object({
        x: number,
        y: number,
    }),
);

// 👍
verify({ x: 1, y: 2 }) === { x: 1, y: 2 };
verify({ x: 1, y: 2, z: 3 }) === { x: 1, y: 2 }; // ⚠️ extra field `z` not returned!

// 👎
verify({ x: 1 });  // throws, missing field `y`
```
<!-- prettier-ignore-end -->

For more information, see also
[The difference between `object`, `exact`, and `inexact`](#the-difference-between-object-exact-and-inexact).

---

<a name="exact" href="#exact">#</a> <b>exact</b><i>&lt;O: { [field: string]:
Decoder&lt;any&gt; }&gt;</i>(mapping: O): <i>Decoder&lt;{ ... }&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/object.js 'Source')

Like `object()`, but will reject inputs that contain extra keys that are not specified
explicitly.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(
    exact({
        x: number,
        y: number,
    }),
);

// 👍
verify({ x: 1, y: 2 }) === { x: 1, y: 2 };

// 👎
verify({ x: 1, y: 2, z: 3 });  // throws, extra field `z` not allowed
verify({ x: 1 });              // throws, missing field `y`
```
<!-- prettier-ignore-end -->

For more information, see also
[The difference between `object`, `exact`, and `inexact`](#the-difference-between-object-exact-and-inexact).

---

<a name="inexact" href="#inexact">#</a> <b>inexact</b><i>&lt;O: { [field: string]:
Decoder&lt;any&gt; }&gt;</i>(mapping: O): <i>Decoder&lt;{ ... }&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/object.js 'Source')

Like `object()`, but will pass through any extra fields on the input object unvalidated
that will thus be of `unknown` type statically.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(
    inexact({
        x: number,
    }),
);

// 👍
verify({ x: 1, y: 2 }) === { x: 1, y: 2 };
verify({ x: 1, y: 2, z: 3 }) === { x: 1, y: 2, z: 3 };

// 👎
verify({ x: 1 });  // throws, missing field `y`
```
<!-- prettier-ignore-end -->

For more information, see also
[The difference between `object`, `exact`, and `inexact`](#the-difference-between-object-exact-and-inexact).

---

<a name="pojo" href="#pojo">#</a> <b>pojo</b>: <i>Decoder&lt;{ [key: string]: unknown
}&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/object.js 'Source')

Accepts any "plain old JavaScript object", but doesn't validate its keys or values
further.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(pojo);

// 👍
verify({}) === {};
verify({ name: 'hi' }) === { name: 'hi' };

// 👎
verify('hi');        // throws
verify([]);          // throws
verify(new Date());  // throws
verify(null);        // throws
```
<!-- prettier-ignore-end -->

---

<a name="dict" href="#dict">#</a> <b>dict</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>):
<i>Decoder&lt;{ [string]: &lt;T&gt;}&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/mapping.js 'Source')

Accepts objects where all values match the given decoder, and returns the result as a
`{ [string]: T }`.

The main difference between `object()` and `dict()` is that you'd typically use `object()`
if this is a record-like object, where all field names are known and the values are
heterogeneous. Whereas with `dict()` the keys are typically dynamic and the values
homogeneous, like in a dictionary, a lookup table, or a cache.

```javascript
const verify = guard(dict(person)); // Assume you have a "person" decoder already

// 👍
verify({
    1: { name: 'Alice' },
    2: { name: 'Bob' },
    3: { name: 'Charlie' },
}); // ≈ {
//     "1": { name: "Alice" },
//     "2": { name: "Bob" },
//     "3": { name: "Charlie" },
// }
```

---

<a name="mapping" href="#mapping">#</a>
<b>mapping</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>): <i>Decoder&lt;Map&lt;string,
T&gt;&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/mapping.js 'Source')

Like `dict()`, but returns the result as a `Map<string, T>` instead.

```javascript
const verify = guard(mapping(person)); // Assume you have a "person" decoder already

// 👍
verify({
    1: { name: 'Alice' },
    2: { name: 'Bob' },
    3: { name: 'Charlie' },
});
// ≈ Map([
//     ['1', { name: 'Alice' }],
//     ['2', { name: 'Bob' }],
//     ['3', { name: 'Charlie' }],
//   ]);
```

---

<a name="json" href="#json">#</a> <b>json</b>: <i>Decoder&lt;JSONValue&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/json.js 'Source')

Accepts any value that's a valid JSON value:

-   `null`
-   `string`
-   `number`
-   `boolean`
-   `{ [string]: JSONValue }`
-   `Array<JSONValue>`

```javascript
const verify = guard(json);

// 👍
verify({
    name: 'Amir',
    age: 27,
    admin: true,
    image: null,
    tags: ['vip', 'staff'],
});
```

Any value returned by `JSON.parse()` should decode without failure.

---

<a name="jsonObject" href="#jsonObject">#</a> <b>jsonObject</b>:
<i>Decoder&lt;JSONObject&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/json.js 'Source')

Like `json`, but will only decode when the JSON value is an object.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(json);

// 👍
verify({});                // ≈ {}
verify({ name: 'Amir' });  // ≈ { name: 'Amir' }

// 👎
verify([]);                   // throws
verify([{ name: 'Alice' }]);  // throws
verify('hello');              // throws
verify(null);                 // throws
```
<!-- prettier-ignore-end -->

---

<a name="jsonArray" href="#jsonArray">#</a> <b>jsonArray</b>:
<i>Decoder&lt;JSONArray&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/json.js 'Source')

Like `json`, but will only decode when the JSON value is an array.

<!-- prettier-ignore-start -->
```javascript
const verify = guard(json);

// 👍
verify([]);                  // ≈ []
verify([{ name: 'Amir' }]);  // ≈ [{ name: 'Amir' }]

// 👎
verify({});                 // throws
verify({ name: 'Alice' });  // throws
verify('hello');            // throws
verify(null);               // throws
```
<!-- prettier-ignore-end -->

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

<a name="transform" href="#transform">#</a> <b>transform</b><i>&lt;T,
V&gt;</i>(<i>Decoder&lt;T&gt;</i>, <i>&lt;T&gt;</i> =&gt; <i>&lt;V&gt;</i>):
<i>Decoder&lt;V&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/utils.js 'Source')<br />

Accepts any value the given decoder accepts, and on success, will call the mapper value
**on the decoded result**. If the mapper function throws an error, the whole decoder will
fail using the error message as the failure reason.

<!-- prettier-ignore-start -->
```javascript
const upper = transform(string, (s) => s.toUpperCase());
const verify = guard(upper);

// 👍
verify('foo') === 'FOO';

// 👎
verify(4);  // throws
```
<!-- prettier-ignore-end -->

---

<a name="compose" href="#compose">#</a> <b>compose</b><i>&lt;T,
V&gt;</i>(<i>Decoder&lt;T&gt;</i>, <i>Decoder&lt;V, T&gt;</i>): <i>Decoder&lt;V&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/composition.js 'Source')<br />

Given a decoder for _T_ and another one for _V_-given-a-_T_. Will first decode the input
using the first decoder, and _if okay_, pass the result on to the second decoder. The
second decoder will thus be able to make more assumptions about its input value, i.e. it
can know what type the input value is (`T` instead of `unknown`).

This is an advanced decoder, typically only useful for authors of decoders. It's not
recommended to rely on this decoder directly for normal usage.

---

<a name="predicate" href="#predicate">#</a>
<b>predicate</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>, <i>&lt;T&gt; => boolean</i>,
string): <i>Decoder&lt;T&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/core/composition.js 'Source')<br />

Accepts values that are accepted by the decoder _and_ also pass the predicate function.

<!-- prettier-ignore-start -->
```typescript
const odd = predicate(
  number,
  (n) => n % 2 !== 0,
  'Must be odd'
);
const verify = guard(odd);

// 👍
verify(3) === 3;

// 👎
verify('hi');  // throws: not a number
verify(42);    // throws: not an odd number
```
<!-- prettier-ignore-end -->

In TypeScript, if you provide a predicate that also doubles as a [type
predicate][type-predicates], then this will be reflected in the return type, too.

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

### The difference between `object`, `exact`, and `inexact`

The three decoders in the "object" family of decoders only differ in how they treat extra
properties on input values.

For example, for a definition like:

```js
import { exact, inexact, number, object, string } from 'decoders';

const thing = {
    a: string,
    b: number,
};
```

And a runtime input of:

```js
{
  a: "hi",
  b: 42,
  c: "extra",  // Note "c" is not a known field
}
```

|                  | Extra properties | Output value                   | Inferred type                               |
| ---------------- | ---------------- | ------------------------------ | ------------------------------------------- |
| `object(thing)`  | discarded        | `{a: "hi", b: 42}`             | `{a: string, b: number}`                    |
| `exact(thing)`   | not allowed      | ⚡️ Runtime error              | `{a: string, b: number}`                    |
| `inexact(thing)` | retained         | `{a: "hi", b: 42, c: "extra"}` | `{a: string, b: number, [string]: unknown}` |

### Building custom decoders

There are two main building blocks for defining your own custom decoders: `transform()`
and `compose()`.

There are roughly 3 use cases that you will want to use:

1. **[Transformation](#transformation)** (i.e. read one type, but return another, or read
   a type but change its value before returning)
1. **[Adding extra value requirements](#adding-predicates)** (i.e. decode using an
   existing decoder, but require an extra value check)
1. **Chaining** multiple decoders (less common, more advanced)

#### Transformation

To read one type from the input, but return another, use:

```js
const numericString: Decoder<number> = transform(
    // At runtime, expect to read a string...
    string,
    // ...but return it as a number
    (s) => Number(s),
);
```

To read one type, but change its value before returning:

```js
const upperCase: Decoder<string> = transform(string, (s) => s.toUpperCase());
```

**WARNING:** While you can map anything to anything, it's typically **NOT A GOOD IDEA to
put too much transformation logic inside decoders**. It's recommended to keep them minimal
and only try to use them for the most basic use cases, like in the examples above. Keeping
business logic outside decoders makes them more reusable and composable.

#### Adding predicates

The easiest way to decode using an existing decoder, but enforcing extra runtime checks on
their values is by wrapping it in a `predicate(...)` construction:

```js
const odd = predicate(integer, (n) => n % 2 !== 0, 'Must be odd');
const shortString = predicate(string, (s) => s.length < 8, 'Must be less than 8 chars');
```

[date-api]:
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
[iso8601-fmt]: https://en.wikipedia.org/wiki/ISO_8601
[type-predicates]:
    https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
