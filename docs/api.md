---
title: API Reference
nav_order: 10
has_children: true
---

# API Reference

<!-- prettier-ignore-start -->
- [**Strings**](#strings): [`string`](#string), [`nonEmptyString`](#nonEmptyString), [`regex()`](#regex), [`email`](#email), [`url`](#url), [`httpsUrl`](#httpsUrl), [`uuid`](#uuid), [`uuidv1`](#uuidv1), [`uuidv4`](#uuidv4)
- [**Numbers**](#numbers): [`number`](#number), [`integer`](#integer), [`positiveNumber`](#positiveNumber), [`positiveInteger`](#positiveInteger)
- [**Booleans**](#booleans): [`boolean`](#boolean), [`truthy`](#truthy), [`numericBoolean`](#numericBoolean)
- [**Dates**](#dates): [`date`](#date), [`iso8601`](#iso8601)
- [**Constants**](#constants): [`constant()`](#constant), [`always()`](#always), [`hardcoded()`](#hardcoded)
- [**Optionality**](#optionality): [`null_`](#null_), [`undefined_`](#undefined_), [`optional()`](#optional), [`nullable()`](#nullable), [`maybe()`](#maybe), [`unknown`](#unknown), [`mixed`](#mixed)
- [**Arrays**](#arrays): [`array()`](#array), [`nonEmptyArray()`](#nonEmptyArray), [`poja`](#poja), [`tuple()`](#tuple), [`set()`](#set)
- [**Objects**](#objects): [`object()`](#object), [`exact()`](#exact), [`inexact()`](#inexact), [`pojo`](#pojo), [`dict()`](#dict), [`mapping()`](#mapping)
- [**JSON values**](#json-values): [`json`](#json), [`jsonObject`](#jsonObject), [`jsonArray`](#jsonArray)
- [**Choice**](#choice): [`either()`](#either), [`taggedUnion()`](#taggedUnion), [`oneOf()`](#oneOf)
- [**Utilities**](#utilities): [`prep()`](#prep), [`never()`](#never), [`fail()`](#fail), [`instanceOf()`](#instanceOf), [`lazy()`](#lazy)
- [**Guards**](#guards): [`guard()`](#guard)
<!-- prettier-ignore-end -->


---

## Available methods on `Decoder<T>`

- [`.decode()`](#decode)
- [`.verify()`](#verify)
- [`.and()`](#and)
- [`.chain()`](#chain)
- [`.transform()`](#transform)
- [`.describe()`](#describe)

---

<a name="decode" href="#decode">#</a>
<b>.decode</b>(blob: mixed): <i>DecodeResult&lt;T&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/_decoder.js 'Source')<br />

Validates the raw/untrusted/unknown input and either accepts or rejects it.
Contrasted with [`.verify()`](#verify), calls to `.decode()` will never fail
and instead return a result type.

For example, take this simple "number" decoder. When given an number value, it
will return an `ok: true` result. Otherwise, it will return an `ok: false`
result with the original input value annotated.

<!-- TODO: Link to explanation of error annotations -->

<!-- prettier-ignore-start -->
```typescript
// 👍
number.decode(3)     // { ok: true, value: 3 };

// 👎
number.decode('hi')  // { ok: false, error: { type: 'scalar', value: 'hi', text: 'Must be number' } }
```
<!-- prettier-ignore-end -->

---

<a name="verify" href="#verify">#</a> <b>.verify</b>(blob: mixed): <i>T</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/_decoder.js 'Source')<br />

Verified the raw/untrusted/unknown input and either accepts or rejects it. When accepted,
returns the `T` value directly. Otherwise fail with a runtime error.

For example, take this simple "number" decoder.

<!-- prettier-ignore-start -->
```typescript
// 👍
number.verify(3)     // 3

// 👎
number.verify('hi')  // throws
```
<!-- prettier-ignore-end -->

---

<a name="and" href="#and">#</a> <b>.and</b>(predicate: <i>&lt;T&gt; =&gt; boolean</i>,
message: <i>string</i>): <i>Decoder&lt;T&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/_decoder.js 'Source')<br />

Accepts values that are accepted by the decoder _and_ also pass the predicate function.

<!-- prettier-ignore-start -->
```typescript
const odd = number.and(
  (n) => n % 2 !== 0,
  'Must be odd'
);

// 👍
odd.verify(3) === 3;

// 👎
odd.verify('hi');  // throws: not a number
odd.verify(42);    // throws: not an odd number
```
<!-- prettier-ignore-end -->

In TypeScript, if you provide a predicate that also doubles as a [type
predicate][ts-predicates], then this will be reflected in the return type, too.

---

<a name="chain" href="#chain">#</a> <b>.chain</b><i>&lt;V&gt;</i>(<i>T</i> =&gt;
<i>DecodeResult&lt;V&gt;</i>): <i>Decoder&lt;V&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/_decoder.js 'Source')<br />

Given a decoder for _T_ and another one for <i>V</i>-given-a-<i>T</i>. Will first decode
the input using the first decoder, and _if accepted_, pass the result on to the second
decoder. The second decoder will thus be able to make more assumptions about its input
value, i.e. it can know what type the input value is (`T` instead of `unknown`).

This is an advanced decoder, typically only useful for authors of decoders. It's not
recommended to rely on this decoder directly for normal usage.

<!-- TODO: Add example -->

---

<a name="then" href="#then">#</a> <b>.then</b><i>&lt;V&gt;</i>(<i>Decoder&lt;V,
T&gt;</i>): <i>Decoder&lt;V&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/_decoder.js 'Source')<br />

Given a decoder for _T_ and another one for <i>V</i>-given-a-<i>T</i>. Will first decode
the input using the first decoder, and _if accepted_, pass the result on to the second
decoder. The second decoder will thus be able to make more assumptions about its input
value, i.e. it can know what type the input value is (`T` instead of `unknown`).

This is an advanced decoder, typically only useful for authors of decoders. It's not
recommended to rely on this decoder directly for normal usage.

<!-- TODO: Add example -->

---

<a name="transform" href="#transform">#</a> <b>.transform</b>(<i>T</i> =&gt; <i>V</i>):
<i>Decoder&lt;V&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/_decoder.js 'Source')<br />

Accepts any value the given decoder accepts, and on success, will call the given function
**on the decoded result**. If the transformation function throws an error, the whole
decoder will fail using the error message as the failure reason.

<!-- prettier-ignore-start -->
```javascript
const upper = string.transform((s) => s.toUpperCase());

// 👍
upper.verify('foo') === 'FOO'

// 👎
upper.verify(4);  // throws
```
<!-- prettier-ignore-end -->

---

<a name="describe" href="#describe">#</a> <b>.describe</b>(message: <i>string</i>):
<i>Decoder&lt;T&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/_decoder.js 'Source')<br />

Uses the given decoder, but will use an alternative error message in case it rejects. This
can be used to simplify or shorten otherwise long or low-level/technical errors.

```javascript
const decoder = either5(
    constant('a'),
    constant('e'),
    constant('i'),
    constant('o'),
    constant('u'),
);
const vowel = decoder.describe('Must be vowel');
```

---

## Strings

-   [`string`](#string)
-   [`nonEmptyString`](#nonEmptyString)
-   [`regex()`](#regex)
-   [`email`](#email)
-   [`url`](#url)
-   [`httpsUrl`](#httpsUrl)
-   [`uuid`](#uuid)
-   [`uuidv1`](#uuidv1)
-   [`uuidv4`](#uuidv4)

---

<a name="string" href="#string">#</a> <b>string</b>: <i>Decoder&lt;string&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/string.js 'Source')

Accepts and returns strings.

<!-- prettier-ignore-start -->
```javascript
// 👍
string.verify('hello world') === 'hello world';
string.verify('🚀') === '🚀';
string.verify('') === '';

// 👎
string.verify(123);   // throws
string.verify(true);  // throws
string.verify(null);  // throws
```
<!-- prettier-ignore-end -->

---

<a name="nonEmptyString" href="#nonEmptyString">#</a> <b>nonEmptyString</b>:
<i>Decoder&lt;string&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/string.js 'Source')

Like [`string`](#string), but will reject the empty string or strings containing only
whitespace.

<!-- prettier-ignore-start -->
```javascript
// 👍
nonEmptyString.verify('hello world') === 'hello world';
nonEmptyString.verify('🚀') === '🚀';

// 👎
nonEmptyString.verify(123);   // throws
nonEmptyString.verify('  ');  // throws
nonEmptyString.verify('');    // throws
```
<!-- prettier-ignore-end -->

---

<a name="regex" href="#regex">#</a> <b>regex</b>(pattern: RegExp, message: string):
<i>Decoder&lt;string&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/string.js 'Source')

Accepts and returns strings that match the given regular expression.

<!-- prettier-ignore-start -->
```javascript
const decoder = regex(/^[0-9][0-9]+$/, 'Must be numeric');

// 👍
decoder.verify('42') === '42';
decoder.verify('83401648364738') === '83401648364738';

// 👎
decoder.verify('');     // throws
decoder.verify('1');    // throws
decoder.verify('foo');  // throws
```
<!-- prettier-ignore-end -->

---

<a name="email" href="#email">#</a> <b>email</b>: <i>Decoder&lt;string&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/string.js 'Source')

Accepts and returns strings that are syntactically valid email addresses. (This will not
mean that the email address actually exist.)

<!-- prettier-ignore-start -->
```javascript
// 👍
email.verify('alice@acme.org') === 'alice@acme.org';

// 👎
email.verify('foo');               // throws
email.verify('@acme.org');         // throws
email.verify('alice @ acme.org');  // throws
```
<!-- prettier-ignore-end -->

---

<a name="url" href="#url">#</a> <b>url</b>: <i>Decoder&lt;URL&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/string.js 'Source')

Accepts strings that are valid URLs, returns the value as a URL instance.

<!-- prettier-ignore-start -->
```javascript
// 👍
url.verify('http://nvie.com') === new URL('http://nvie.com/');
url.verify('https://nvie.com') === new URL('https://nvie.com/');
url.verify('git+ssh://user@github.com/foo/bar.git') === new URL('git+ssh://user@github.com/foo/bar.git');

// 👎
url.verify('foo');               // throws
url.verify('@acme.org');         // throws
url.verify('alice @ acme.org');  // throws
url.verify('/search?q=foo');     // throws
```
<!-- prettier-ignore-end -->

---

<a name="httpsUrl" href="#httpsUrl">#</a> <b>httpsUrl</b>: <i>Decoder&lt;URL&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/string.js 'Source')

Accepts strings that are valid URLs, but only HTTPS ones. Returns the value as a URL
instance.

<!-- prettier-ignore-start -->
```javascript
// 👍
httpsUrl.verify('https://nvie.com:443') === new URL('https://nvie.com/');

// 👎
httpsUrl.verify('http://nvie.com');                        // throws, not HTTPS
httpsUrl.verify('git+ssh://user@github.com/foo/bar.git');  // throws, not HTTPS
```
<!-- prettier-ignore-end -->

**Tip!** If you need to limit URLs to different protocols than HTTP, you can do as the
HTTPS decoder is implemented: by adding further conditions using an [`.and()`](#and) call.

```typescript
import { url } from 'decoders';

const gitUrl: Decoder<URL> = url.and(
    (value) => value.protocol === 'git:',
    'Must be a git:// URL',
);
```

---

<a name="uuid" href="#uuid">#</a> <b>uuid</b>: <i>Decoder&lt;string&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/string.js 'Source')

Accepts strings that are valid [UUIDs][wiki-uuid] (universally unique identifier).

<!-- prettier-ignore-start -->
```javascript
// 👍
uuid.verify('123e4567-e89b-12d3-a456-426614174000') === '123e4567-e89b-12d3-a456-426614174000'
uuid.verify('123E4567-E89B-12D3-A456-426614174000') === '123E4567-E89B-12D3-A456-426614174000'

// 👎
uuid.verify('123E4567E89B12D3A456426614174000');      // throws
uuid.verify('abcdefgh-ijkl-mnop-qrst-uvwxyz012345');  // throws
```
<!-- prettier-ignore-end -->

---

<a name="uuidv1" href="#uuidv1">#</a> <b>uuidv1</b>: <i>Decoder&lt;string&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/string.js 'Source')

Like `uuid`, but only accepts [UUIDv1s][wiki-uuidv1] strings.

<!-- prettier-ignore-start -->
```javascript
// 👍
uuidv1.verify('123e4567-e89b-12d3-a456-426614174000') === '123e4567-e89b-42d3-a456-426614174000'

// 👎
uuidv1.verify('123e4567-e89b-42d3-a456-426614174000')  // throws
```
<!-- prettier-ignore-end -->

---

<a name="uuidv4" href="#uuidv4">#</a> <b>uuidv4</b>: <i>Decoder&lt;string&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/string.js 'Source')

Like `uuid`, but only accepts [UUIDv4s][wiki-uuidv4] strings.

<!-- prettier-ignore-start -->
```javascript
// 👍
uuidv4.verify('123e4567-e89b-42d3-a456-426614174000') === '123e4567-e89b-42d3-a456-426614174000'

// 👎
uuidv4.verify('123e4567-e89b-12d3-a456-426614174000')  // throws
```
<!-- prettier-ignore-end -->

---

## Numbers

-   [`number`](#number)
-   [`integer`](#integer)
-   [`positiveNumber`](#positiveNumber)
-   [`positiveInteger`](#positiveInteger)

---

<a name="number" href="#number">#</a> <b>number</b>: <i>Decoder&lt;number&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/number.js 'Source')

Accepts and returns finite numbers (integer or float values). Values `NaN`, or positive
and negative `Infinity` will get rejected.

<!-- prettier-ignore-start -->
```javascript
// 👍
number.verify(123) === 123;
number.verify(-3.14) === -3.14;

// 👎
number.verify(Infinity);        // throws
number.verify(NaN);             // throws
number.verify('not a number');  // throws
```
<!-- prettier-ignore-end -->

---

<a name="integer" href="#integer">#</a> <b>integer</b>: <i>Decoder&lt;integer&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/number.js 'Source')

Like `number`, but only accepts values that are whole numbers.

<!-- prettier-ignore-start -->
```javascript
// 👍
integer.verify(123) === 123;

// 👎
integer.verify(-3.14);           // throws
integer.verify(Infinity);        // throws
integer.verify(NaN);             // throws
integer.verify('not a integer'); // throws
```
<!-- prettier-ignore-end -->

---

<a name="positiveNumber" href="#positiveNumber">#</a> <b>positiveNumber</b>:
<i>Decoder&lt;number&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/number.js 'Source')

Accepts only positive finite numbers (integer or float values).

<!-- prettier-ignore-start -->
```javascript
// 👍
positiveNumber.verify(123) === 123;

// 👎
positiveNumber.verify(-42);             // throws
positiveNumber.verify(3.14);            // throws
positiveNumber.verify(Infinity);        // throws
positiveNumber.verify(NaN);             // throws
positiveNumber.verify('not a number');  // throws
```
<!-- prettier-ignore-end -->

---

<a name="positiveInteger" href="#positiveInteger">#</a> <b>positiveInteger</b>:
<i>Decoder&lt;number&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/number.js 'Source')

Accepts only positive finite integers.

<!-- prettier-ignore-start -->
```javascript
// 👍
positiveInteger.verify(123) === 123;

// 👎
positiveInteger.verify(-3);              // throws
positiveInteger.verify(3.14);            // throws
positiveInteger.verify(Infinity);        // throws
positiveInteger.verify(NaN);             // throws
positiveInteger.verify('not a number');  // throws
```
<!-- prettier-ignore-end -->

---

## Booleans

-   [`boolean`](#boolean)
-   [`truthy`](#truthy)
-   [`numericBoolean`](#numericBoolean)

---

<a name="boolean" href="#boolean">#</a> <b>boolean</b>: <i>Decoder&lt;boolean&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/boolean.js 'Source')

Accepts and returns booleans.

<!-- prettier-ignore-start -->
```javascript
// 👍
boolean.verify(false) === false;
boolean.verify(true) === true;

// 👎
boolean.verify(undefined);      // throws
boolean.verify('hello world');  // throws
boolean.verify(123);            // throws
```
<!-- prettier-ignore-end -->

---

<a name="truthy" href="#truthy">#</a> <b>truthy</b>: <i>Decoder&lt;boolean&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/boolean.js 'Source')

Accepts anything and will return its "truth" value. Will never reject.

```javascript
// 👍
truthy.verify(false) === false;
truthy.verify(true) === true;
truthy.verify(undefined) === false;
truthy.verify('hello world') === true;
truthy.verify('false') === true;
truthy.verify(0) === false;
truthy.verify(1) === true;
truthy.verify(null) === false;

// 👎
// This decoder will never reject an input
```

---

<a name="numericBoolean" href="#numericBoolean">#</a> <b>numericBoolean</b>:
<i>Decoder&lt;boolean&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/boolean.js 'Source')

Accepts numbers, but return their boolean representation.

<!-- prettier-ignore-start -->
```javascript
// 👍
numericBoolean.verify(-1) === true;
numericBoolean.verify(0) === false;
numericBoolean.verify(123) === true;

// 👎
numericBoolean.verify(false);      // throws
numericBoolean.verify(true);       // throws
numericBoolean.verify(undefined);  // throws
numericBoolean.verify('hello');    // throws
```
<!-- prettier-ignore-end -->

---

## Dates

-   [`date`](#date)
-   [`iso8601`](#iso8601)

---

<a name="date" href="#date">#</a> <b>date</b>: <i>Decoder&lt;Date&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/date.js 'Source')

Accepts and returns JavaScript [Date][moz-date] values.

<!-- prettier-ignore-start -->
```javascript
const now = new Date();

// 👍
date.verify(now) === now;

// 👎
date.verify(123);      // throws
date.verify('hello');  // throws
```
<!-- prettier-ignore-end -->

---

<a name="iso8601" href="#iso8601">#</a> <b>iso8601</b>: <i>Decoder&lt;Date&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/date.js 'Source')

Accepts [ISO8601][wiki-iso]-formatted strings, returns then as [Date][moz-date] instances.
This is very useful for working with dates in APIs: serialize them as `.toISOString()`
when sending, decode them with `iso8601` when receiving.

<!-- prettier-ignore-start -->
```javascript
// 👍
iso8601.verify('2020-06-01T12:00:00Z'); // ≈ new Date('2020-06-01T12:00:00Z')

// 👎
iso8601.verify('2020-06-01');  // throws
iso8601.verify('hello');       // throws
iso8601.verify(123);           // throws
iso8601.verify(new Date());    // throws (does not accept dates)
```
<!-- prettier-ignore-end -->

---

## Constants

-   [`constant()`](#constant)
-   [`always()`](#always)
-   [`hardcoded()`](#hardcoded) (alias of [`always()`](#always))

---

<a name="constant" href="#constant">#</a> <b>constant</b><i>&lt;T&gt;</i>(value: T):
<i>Decoder&lt;T&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/constants.js 'Source')

Accepts only the given constant value.

⚠️ **NOTE:** Flow, unlike TypeScript, will not infer constants correctly. In TypeScript,
the type of `constant(42)` will correctly be `Decoder<42>`, but in Flow it will get
inferred as `Decoder<number>`. To work around this, you should use this syntax in Flow:
`constant((42: 42))`.

<!-- prettier-ignore-start -->
```typescript
const decoder = constant('hello');

// 👍
decoder.verify('hello') === 'hello';

// 👎
decoder.verify('this breaks');  // throws
decoder.verify(false);          // throws
decoder.verify(undefined);      // throws
```
<!-- prettier-ignore-end -->

---

<a name="always" href="#always">#</a> <b>always</b><i>&lt;T&gt;</i>(value: T):
<i>Decoder&lt;T&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/constants.js 'Source')<br />
<a name="hardcoded" href="#hardcoded">#</a> <b>hardcoded</b><i>&lt;T&gt;</i>(value: T):
<i>Decoder&lt;T&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/constants.js 'Source')

Accepts anything, completely ignores it, and always returns the provided value. This is
useful to manually add extra fields to object decoders.

<!-- prettier-ignore-start -->
```javascript
const decoder = always(42);

// 👍
decoder.verify('hello') === 42;
decoder.verify(false) === 42;
decoder.verify(undefined) === 42;

// 👎
// This decoder will never reject an input
```
<!-- prettier-ignore-end -->

---

## Optionality

-   [`null_`](#null_)
-   [`undefined_`](#undefined_)
-   [`optional()`](#optional)
-   [`nullable()`](#nullable)
-   [`maybe()`](#maybe)
-   [`unknown`](#unknown)
-   [`mixed`](#mixed) (alias of [`unknown`](#unknown))

---

<a name="null_" href="#null_">#</a> <b>null\_</b>: <i>Decoder&lt;null&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/constants.js 'Source')

Accepts and returns only the literal `null` value.

<!-- prettier-ignore-start -->
```javascript
// 👍
null_.verify(null) === null;

// 👎
null_.verify(false);         // throws
null_.verify(undefined);     // throws
null_.verify('hello world'); // throws
```
<!-- prettier-ignore-end -->

---

<a name="undefined_" href="#undefined_">#</a> <b>undefined\_</b>:
<i>Decoder&lt;undefined&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/constants.js 'Source')

Accepts and returns only the literal `undefined` value.

<!-- prettier-ignore-start -->
```javascript
// 👍
undefined_.verify(undefined) === undefined;

// 👎
undefined_.verify(null);          // throws
undefined_.verify(false);         // throws
undefined_.verify('hello world'); // throws
```
<!-- prettier-ignore-end -->

---

<a name="optional" href="#optional">#</a>
<b>optional</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>): <i>Decoder&lt;T |
undefined&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/optional.js 'Source')

Accepts `undefined`, or whatever the given decoder accepts.

<!-- prettier-ignore-start -->
```javascript
const decoder = optional(string);

// 👍
decoder.verify('hello') === 'hello';
decoder.verify(undefined) === undefined;

// 👎
decoder.verify(null);  // throws
decoder.verify(0);     // throws
decoder.verify(42);    // throws
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
[(source)](https://github.com/nvie/decoders/blob/main/src/core/optional.js 'Source')

Accepts `null`, or whatever the given decoder accepts.

<!-- prettier-ignore-start -->
```javascript
const decoder = nullable(string);

// 👍
decoder.verify('hello') === 'hello';
decoder.verify(null) === null;

// 👎
decoder.verify(undefined);  // throws
decoder.verify(0);          // throws
decoder.verify(42);         // throws
```
<!-- prettier-ignore-end -->

---

<a name="maybe" href="#maybe">#</a> <b>maybe</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>):
<i>Decoder&lt;?T&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/optional.js 'Source')

Accepts `undefined`, `null`, or whatever the given decoder accepts.

<!-- prettier-ignore-start -->
```javascript
const decoder = maybe(string);

// 👍
decoder.verify('hello') === 'hello';
decoder.verify(null) === null;
decoder.verify(undefined) === undefined;

// 👎
decoder.verify(0);   // throws
decoder.verify(42);  // throws
```
<!-- prettier-ignore-end -->

---

<a name="unknown" href="#unknown">#</a> <b>unknown</b>: <i>Decoder&lt;unknown&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/constants.js 'Source')<br />
<a name="mixed" href="#mixed">#</a> <b>mixed</b>: <i>Decoder&lt;mixed&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/constants.js 'Source')<br />

Accepts anything and returns it unchanged. Useful for situation in which you don't know or
expect a specific type. Of course, the downside is that you won't know the type of the
value statically and you'll have to further refine it yourself.

```javascript
// 👍
unknown.verify('hello') === 'hello';
unknown.verify(false) === false;
unknown.verify(undefined) === undefined;
unknown.verify([1, 2]) === [1, 2];

// 👎
// This decoder will never reject an input
```

---

## Arrays

-   [`array()`](#array)
-   [`nonEmptyArray()`](#nonEmptyArray)
-   [`poja`](#poja)
-   [`tuple()`](#tuple)
-   [`set()`](#set)

---

<a name="array" href="#array">#</a> <b>array</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>):
<i>Decoder&lt;Array&lt;T&gt;&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/array.js 'Source')

Accepts arrays of whatever the given decoder accepts.

<!-- prettier-ignore-start -->
```javascript
const decoder = array(string);

// 👍
decoder.verify(['hello', 'world']) === ['hello', 'world'];

// 👎
decoder.verify(['hello', 1.2]);  // throws
```
<!-- prettier-ignore-end -->

---

<a name="nonEmptyArray" href="#nonEmptyArray">#</a>
<b>nonEmptyArray</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>):
<i>Decoder&lt;Array&lt;T&gt;&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/array.js 'Source')

Like `array()`, but will reject arrays with 0 elements.

<!-- prettier-ignore-start -->
```javascript
const decoder = nonEmptyArray(string);

// 👍
decoder.verify(['hello', 'world']) === ['hello', 'world'];

// 👎
decoder.verify(['hello', 1.2]);  // throws
decoder.verify([]);              // throws
```
<!-- prettier-ignore-end -->

---

<a name="poja" href="#poja">#</a> <b>poja</b>: <i>Decoder&lt;Array&lt;unknown&gt;&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/array.js 'Source')

Accepts any array, but doesn't validate its items further.

"poja" means "plain old JavaScript array", a play on ["pojo"](#pojo).

<!-- prettier-ignore-start -->
```javascript
// 👍
poja.verify([1, 'hi', true]) === [1, 'hi', true];
poja.verify(['hello', 'world']) === ['hello', 'world'];
poja.verify([]) === [];

// 👎
poja.verify({});    // throws
poja.verify('hi');  // throws
```
<!-- prettier-ignore-end -->

---

<a name="tuple" href="#tuple">#</a> <b>tuple</b><i>&lt;A, B, C,
...&gt;</i>(<i>Decoder&lt;A&gt;</i>, <i>Decoder&lt;B&gt;</i>, <i>Decoder&lt;C&gt;</i>):
<i>Decoder&lt;[A, B, C, ...]&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/tuple.js 'Source')

Accepts a tuple (an array with exactly _n_ items) of values accepted by the _n_ given
decoders.

<!-- prettier-ignore-start -->
```javascript
const decoder = tuple(string, number);

// 👍
decoder.verify(['hello', 1.2]) === ['hello', 1.2];

// 👎
decoder.verify([]);                  // throws, too few items
decoder.verify(['hello', 'world']);  // throws, not the right types
decoder.verify(['a', 1, 'c']);       // throws, too many items
```
<!-- prettier-ignore-end -->

---

<a name="set" href="#set">#</a> <b>set</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>):
<i>Decoder&lt;Set&lt;T&gt;&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/array.js 'Source')

Similar to [`array()`](#array), but returns the result as an [ES6 Set][moz-set].

<!-- prettier-ignore-start -->
```javascript
const decoder = set(string);

// 👍
decoder.verify(['abc', 'pqr'])  // ≈ new Set(['abc', 'pqr'])
decoder.verify([])              // ≈ new Set([])

// 👎
decoder.verify([1, 2]);         // throws, not the right types
```
<!-- prettier-ignore-end -->

---

## Objects

-   [`object()`](#object)
-   [`exact()`](#exact)
-   [`inexact()`](#inexact)
-   [`pojo`](#pojo)
-   [`dict()`](#dict)
-   [`mapping()`](#mapping)

---

<a name="object" href="#object">#</a> <b>object</b><i>&lt;O: { [field: string]:
Decoder&lt;any&gt; }&gt;</i>(mapping: O): <i>Decoder&lt;{ ... }&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/object.js 'Source')

Accepts objects with fields matching the given decoders. Extra fields that exist on the
input object are ignored and will not be returned.

<!-- prettier-ignore-start -->
```javascript
const decoder = object({
    x: number,
    y: number,
});

// 👍
decoder.verify({ x: 1, y: 2 }) === { x: 1, y: 2 };
decoder.verify({ x: 1, y: 2, z: 3 }) === { x: 1, y: 2 }; // ⚠️ extra field `z` not returned!

// 👎
decoder.verify({ x: 1 });  // throws, missing field `y`
```
<!-- prettier-ignore-end -->

For more information, see also
[The difference between `object`, `exact`, and `inexact`](./tips#the-difference-between-object-exact-and-inexact).

---

<a name="exact" href="#exact">#</a> <b>exact</b><i>&lt;O: { [field: string]:
Decoder&lt;any&gt; }&gt;</i>(mapping: O): <i>Decoder&lt;{ ... }&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/object.js 'Source')

Like `object()`, but will reject inputs that contain extra keys that are not specified
explicitly.

<!-- prettier-ignore-start -->
```javascript
const decoder = exact({
    x: number,
    y: number,
});

// 👍
decoder.verify({ x: 1, y: 2 }) === { x: 1, y: 2 };

// 👎
decoder.verify({ x: 1, y: 2, z: 3 });  // throws, extra field `z` not allowed
decoder.verify({ x: 1 });              // throws, missing field `y`
```
<!-- prettier-ignore-end -->

For more information, see also
[The difference between `object`, `exact`, and `inexact`](./tips#the-difference-between-object-exact-and-inexact).

---

<a name="inexact" href="#inexact">#</a> <b>inexact</b><i>&lt;O: { [field: string]:
Decoder&lt;any&gt; }&gt;</i>(mapping: O): <i>Decoder&lt;{ ... }&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/object.js 'Source')

Like `object()`, but will pass through any extra fields on the input object unvalidated
that will thus be of `unknown` type statically.

<!-- prettier-ignore-start -->
```javascript
const decoder = inexact({
    x: number,
});

// 👍
decoder.verify({ x: 1, y: 2 }) === { x: 1, y: 2 };
decoder.verify({ x: 1, y: 2, z: 3 }) === { x: 1, y: 2, z: 3 };

// 👎
decoder.verify({ x: 1 });  // throws, missing field `y`
```
<!-- prettier-ignore-end -->

For more information, see also
[The difference between `object`, `exact`, and `inexact`](./tips#the-difference-between-object-exact-and-inexact).

---

<a name="pojo" href="#pojo">#</a> <b>pojo</b>: <i>Decoder&lt;{ [key: string]: unknown
}&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/object.js 'Source')

Accepts any "plain old JavaScript object", but doesn't validate its keys or values
further.

<!-- prettier-ignore-start -->
```javascript
// 👍
pojo.verify({}) === {};
pojo.verify({ name: 'hi' }) === { name: 'hi' };

// 👎
pojo.verify('hi');        // throws
pojo.verify([]);          // throws
pojo.verify(new Date());  // throws
pojo.verify(null);        // throws
```
<!-- prettier-ignore-end -->

---

<a name="dict" href="#dict">#</a> <b>dict</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>):
<i>Decoder&lt;{ [string]: T }&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/object.js 'Source')

Accepts objects where all values match the given decoder, and returns the result as a
`{ [string]: T }`.

The main difference between `object()` and `dict()` is that you'd typically use `object()`
if this is a record-like object, where all field names are known and the values are
heterogeneous. Whereas with `dict()` the keys are typically dynamic and the values
homogeneous, like in a dictionary, a lookup table, or a cache.

```javascript
const decoder = dict(number);

// 👍
decoder.verify({ red: 1, blue: 2, green: 3 }); // ≈ { red: 1, blue: 2, green: 3 }
```

---

<a name="mapping" href="#mapping">#</a>
<b>mapping</b><i>&lt;T&gt;</i>(<i>Decoder&lt;T&gt;</i>): <i>Decoder&lt;Map&lt;string,
T&gt;&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/object.js 'Source')

Similar to `dict()`, but returns the result as a `Map<string, T>` (an [ES6 Map][moz-map])
instead.

```javascript
const decoder = mapping(number);

// 👍
decoder.verify({ red: 1, blue: 2, green: 3 });
// ≈ Map([
//     ['red', '1'],
//     ['blue', '2'],
//     ['green', '3'],
//   ]);
```

---

## JSON values

-   [`json`](#json)
-   [`jsonObject`](#jsonObject)
-   [`jsonArray`](#jsonArray)

---

<a name="json" href="#json">#</a> <b>json</b>: <i>Decoder&lt;JSONValue&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/json.js 'Source')

Accepts any value that's a valid JSON value:

-   `null`
-   `string`
-   `number`
-   `boolean`
-   `{ [string]: JSONValue }`
-   `Array<JSONValue>`

```javascript
// 👍
json.verify({
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
[(source)](https://github.com/nvie/decoders/blob/main/src/core/json.js 'Source')

Like `json`, but will only decode when the JSON value is an object.

<!-- prettier-ignore-start -->
```javascript
// 👍
jsonObject.verify({});                // ≈ {}
jsonObject.verify({ name: 'Amir' });  // ≈ { name: 'Amir' }

// 👎
jsonObject.verify([]);                   // throws
jsonObject.verify([{ name: 'Alice' }]);  // throws
jsonObject.verify('hello');              // throws
jsonObject.verify(null);                 // throws
```
<!-- prettier-ignore-end -->

---

<a name="jsonArray" href="#jsonArray">#</a> <b>jsonArray</b>:
<i>Decoder&lt;JSONArray&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/json.js 'Source')

Like `json`, but will only decode when the JSON value is an array.

<!-- prettier-ignore-start -->
```javascript
// 👍
jsonArray.verify([]);                  // ≈ []
jsonArray.verify([{ name: 'Amir' }]);  // ≈ [{ name: 'Amir' }]

// 👎
jsonArray.verify({});                 // throws
jsonArray.verify({ name: 'Alice' });  // throws
jsonArray.verify('hello');            // throws
jsonArray.verify(null);               // throws
```
<!-- prettier-ignore-end -->

---

## Choice

-   [`either()`](#either)
-   [`taggedUnion()`](#taggedUnion)
-   [`oneOf()`](#oneOf)

---

<a name="either" href="#either">#</a> <b>either</b><i>&lt;A, B, C,
...&gt;</i>(<i>Decoder&lt;A&gt;</i>, <i>Decoder&lt;B&gt;</i>, <i>Decoder&lt;C&gt;</i>,
...): <i>Decoder&lt;A | B | C | ...&gt;</i><br />
[(source)](https://github.com/nvie/decoders/blob/main/src/core/either.js 'Source')<br />

Accepts values accepted by any of the given decoders. The decoders are tried on the input
one by one, in the given order. The first one that accepts the input "wins". If all
decoders reject the input, the input gets rejected.

<!-- prettier-ignore-start -->
```javascript
const decoder = either(number, string);

// 👍
decoder.verify('hello world') === 'hello world';
decoder.verify(123) === 123;

// 👎
decoder.verify(false);  // throws
```
<!-- prettier-ignore-end -->

**NOTE to Flow users:** In Flow, there is a max of 9 arguments with this construct. (This
is no problem in TypeScript.) If you hit the 9 argument limit, you can work around that by
stacking, e.g. do `either(<8 arguments here>, either(...))`.

---

<!-- prettier-ignore-start -->
<a name="dispatch" href="#dispatch"></a>
<a name="taggedUnion" href="#taggedUnion">#</a> <b>taggedUnion</b><i>&lt;O: { [field: string]: (Decoder&lt;T&gt; | Decoder&lt;V&gt; | ...) }&gt;</i>(field: string, mapping: O): <i>Decoder&lt;T | V | ...&gt;</i>
<!-- prettier-ignore-end -->

[(source)](https://github.com/nvie/decoders/blob/main/src/core/dispatch.js 'Source')

**NOTE:** In decoders@1.x, this was called `dispatch()`.

Like `either`, but optimized for building [tagged unions][wiki-taggedunion] of object
types with a common field (like a `type` field) that lets you distinguish members.

The following two decoders are effectively equivalent:

```javascript
type Rect = { __type: 'rect', x: number, y: number, width: number, height: number };
type Circle = { __type: 'circle', cx: number, cy: number, r: number };
//              ^^^^^^
//              Field that defines which decoder to pick
//                                               vvvvvv
const shape1: Decoder<Rect | Circle> = taggedUnion('__type', { rect, circle });
const shape2: Decoder<Rect | Circle> = either(rect, circle);
```

But using `taggedUnion()` will typically be more runtime-efficient than using `either()`.
The reason is that `taggedUnion()` will first do minimal work to "look ahead" into the
`type` field here, and based on that value, pick which decoder to invoke. Error messages
will then also be tailored to the specific decoder.

The `either()` version will instead try each decoder in turn until it finds one that
matches. If none of the alternatives match, it needs to report all errors, which is
sometimes confusing.

---

<a name="oneOf" href="#oneOf">#</a> <b>oneOf</b><i>&lt;T&gt;</i>(<i>Array&lt;T&gt;</i>):
<i>Decoder&lt;T&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/either.js 'Source')<br />

Accepts any value that is strictly-equal (using `===`) to one of the specified values.

<!-- prettier-ignore-start -->
```javascript
const decoder = oneOf(['foo', 'bar', 3]);

// 👍
decoder.verify('foo') === 'foo';
decoder.verify(3) === 3;

// 👎
decoder.verify('hello');  // throws
decoder.verify(4);        // throws
decoder.verify(false);    // throws
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

## Utilities

-   [`prep()`](#prep)
-   [`never()`](#never)
-   [`fail()`](#fail) (alias of [`never()`](#never))
-   [`instanceOf()`](#instanceOf)
-   [`lazy()`](#lazy)

---

<a name="prep" href="#prep">#</a> <b>prep</b><i>&lt;T, I&gt;</i>(<i>unknown =&gt; I</i>,
<i>Decoder&lt;T, I&gt;</i>): <i>Decoder&lt;T&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/composition.js 'Source')<br />

Pre-process the raw data input before passing it into the decoder. This gives you the
ability to arbitrarily customize the input on the fly before passing it to the decoder. Of
course, the input value at that point is still of `unknown` type, so you will have to deal
with that accordingly.

<!-- prettier-ignore-start -->
```typescript
const decoder = prep(
  // Will convert any input to an int first, before feeding it to
  // positiveInteger. This will effectively also allow numeric strings
  // to be accepted (and returned) as integers. If this ever throws,
  // then the error message will be what gets annotated on the input.
  x => parseInt(x),
  positiveInteger,
);

// 👍
decoder.verify(42) === 42;
decoder.verify('3') === 3;

// 👎
decoder.verify('-3');  // throws: not a positive number
decoder.verify('hi');  // throws: not a number
```
<!-- prettier-ignore-end -->

---

<a name="never" href="#never">#</a> <b>never</b>(): <i>Decoder&lt;never&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/never.js 'Source')<br />
<a name="fail" href="#fail">#</a> <b>fail</b>(): <i>Decoder&lt;empty&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/never.js 'Source')

Rejects all inputs, and always fails with the given error message. May be useful for
explicitly disallowing keys, or for testing purposes.

<!-- prettier-ignore-start -->
```javascript
const decoder = object({
  a: string,
  b: optional(never('Key b has been removed')),
});

// 👍
decoder.verify({ a: 'foo' });            // ≈ { a: 'foo' };
decoder.verify({ a: 'foo', c: 'bar' });  // ≈ { a: 'foo' };

// 👎
decoder.verify({ a: 'foo', b: 'bar' });  // throws
```
<!-- prettier-ignore-end -->

---

<a name="instanceOf" href="#instanceOf">#</a>
<b>instanceOf</b><i>&lt;T&gt;</i>(<i>Class&lt;T&gt;</i>): <i>Decoder&lt;T&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/instanceOf.js 'Source')<br />

Accepts any value that is an `instanceof` the given class.

<!-- prettier-ignore-start -->
```javascript
const decoder = instanceOf(Error);

// 👍
const value = new Error('foo');
decoder.verify(value) === value;

// 👎
decoder.verify('foo');  // throws
decoder.verify(3);      // throws
```
<!-- prettier-ignore-end -->

---

<a name="lazy" href="#lazy">#</a> <b>lazy</b><i>&lt;T&gt;</i>(() =&gt;
<i>Decoder&lt;T&gt;</i>): <i>Decoder&lt;T&gt;</i>
[(source)](https://github.com/nvie/decoders/blob/main/src/core/lazy.js 'Source')<br />

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

---

<!-- prettier-ignore-start -->
[moz-date]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
[moz-set]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
[moz-map]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
[wiki-iso]: https://en.wikipedia.org/wiki/ISO_8601
[wiki-uuid]: https://en.wikipedia.org/wiki/Universally_unique_identifier
[wiki-uuidv1]: https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_1_(date-time_and_MAC_address)
[wiki-uuidv4]: https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)
[ts-predicates]: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
[wiki-taggedunion]: https://en.wikipedia.org/wiki/Tagged_union
<!-- prettier-ignore-end -->
