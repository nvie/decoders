---
title: Built-in decoders
parent: API Reference
nav_order: 20
---

<!--[[[cog
import cog
import html
import re
import textwrap
from _data import DECODERS, DECODERS_BY_SECTION
from _lib import (
  get_markdown,
  get_signature_html,
  ref,
  slugify,
)
]]]-->
<!--[[[end]]] (checksum: d41d8cd98f00b204e9800998ecf8427e) -->

# Built-in decoders

All "batteries included" decoders available in the standard library.

<!-- prettier-ignore-start -->
<!--[[[cog
for section, names in DECODERS_BY_SECTION.items():
  cog.outl(f'- [**{section}**](#{slugify(section)}): {", ".join(ref(name) for name in names)}')
]]]-->
- [**Strings**](#strings): [`string`](/api.html#string), [`nonEmptyString`](/api.html#nonEmptyString), [`regex()`](/api.html#regex), [`decimal`](/api.html#decimal), [`hexadecimal`](/api.html#hexadecimal), [`numeric`](/api.html#numeric), [`email`](/api.html#email), [`url`](/api.html#url), [`httpsUrl`](/api.html#httpsUrl), [`identifier`](/api.html#identifier), [`nanoid`](/api.html#nanoid), [`uuid`](/api.html#uuid), [`uuidv1`](/api.html#uuidv1), [`uuidv4`](/api.html#uuidv4)
- [**Numbers**](#numbers): [`number`](/api.html#number), [`integer`](/api.html#integer), [`positiveNumber`](/api.html#positiveNumber), [`positiveInteger`](/api.html#positiveInteger), [`anyNumber`](/api.html#anyNumber), [`bigint`](/api.html#bigint)
- [**Booleans**](#booleans): [`boolean`](/api.html#boolean), [`truthy`](/api.html#truthy)
- [**Dates**](#dates): [`date`](/api.html#date), [`iso8601`](/api.html#iso8601), [`datelike`](/api.html#datelike)
- [**Constants**](#constants): [`constant()`](/api.html#constant), [`always()`](/api.html#always), [`hardcoded()`](/api.html#hardcoded)
- [**Optionality**](#optionality): [`null_`](/api.html#null_), [`undefined_`](/api.html#undefined_), [`optional()`](/api.html#optional), [`nullable()`](/api.html#nullable), [`nullish()`](/api.html#nullish), [`unknown`](/api.html#unknown), [`maybe()`](/api.html#maybe), [`mixed`](/api.html#mixed)
- [**Arrays**](#arrays): [`array()`](/api.html#array), [`nonEmptyArray()`](/api.html#nonEmptyArray), [`poja`](/api.html#poja), [`tuple()`](/api.html#tuple)
- [**Objects**](#objects): [`object()`](/api.html#object), [`exact()`](/api.html#exact), [`inexact()`](/api.html#inexact), [`pojo`](/api.html#pojo)
- [**Collections**](#collections): [`record()`](/api.html#record), [`dict()`](/api.html#dict), [`mapping()`](/api.html#mapping), [`setFromArray()`](/api.html#setFromArray), [`set()`](/api.html#set)
- [**JSON values**](#json-values): [`json`](/api.html#json), [`jsonObject`](/api.html#jsonObject), [`jsonArray`](/api.html#jsonArray)
- [**Unions**](#unions): [`either()`](/api.html#either), [`oneOf()`](/api.html#oneOf), [`enum_()`](/api.html#enum_), [`taggedUnion()`](/api.html#taggedUnion), [`select()`](/api.html#select)
- [**Utilities**](#utilities): [`define()`](/api.html#define), [`prep()`](/api.html#prep), [`never`](/api.html#never), [`instanceOf()`](/api.html#instanceOf), [`lazy()`](/api.html#lazy), [`fail`](/api.html#fail)
<!--[[[end]]] (checksum: 37f9fc6b535cb97e7f8973f2baa5cf2c) -->

<!--[[[cog
for section, names in DECODERS_BY_SECTION.items():
  # Section heading
  cog.outl(f"""
    ---

    ## {section}

  """, dedent=True, trimblanklines=True)

  # Section index
  for name in names:
    info = DECODERS[name]
    alias_of = info.get('alias_of')
    if alias_of:
      cog.outl(f'- {ref(name)} (alias of {ref(alias_of)})')
    else:
      cog.outl(f'- {ref(name)}')

  cog.outl()

  # Section contents
  for name in names:
    info = DECODERS[name]
    if info.get('alias_of'):
      continue

    markdown = get_markdown(name)

    cog.outl('---')

    cog.outl()
    cog.outl(get_signature_html(name))

    cog.outl()
    cog.outl(get_markdown(name))
    cog.outl()
]]]-->
---

## Strings


- [`string`](/api.html#string)
- [`nonEmptyString`](/api.html#nonEmptyString)
- [`regex()`](/api.html#regex)
- [`decimal`](/api.html#decimal)
- [`hexadecimal`](/api.html#hexadecimal)
- [`numeric`](/api.html#numeric)
- [`email`](/api.html#email)
- [`url`](/api.html#url)
- [`httpsUrl`](/api.html#httpsUrl)
- [`identifier`](/api.html#identifier)
- [`nanoid`](/api.html#nanoid)
- [`uuid`](/api.html#uuid)
- [`uuidv1`](/api.html#uuidv1)
- [`uuidv4`](/api.html#uuidv4)

---

<a href="#string">#</a> **string**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;string&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/strings.ts#L20-L25 'Source')
{: #string .signature}

Accepts and returns strings.

```ts
// 👍
string.verify('hello world') === 'hello world';
string.verify('🚀') === '🚀';
string.verify('') === '';

// 👎
string.verify(123);   // throws
string.verify(true);  // throws
string.verify(null);  // throws
```

---

<a href="#nonEmptyString">#</a> **nonEmptyString**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;string&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/strings.ts#L27-L30 'Source')
{: #nonEmptyString .signature}

Like [`string`](/api.html#string), but will reject the empty string or strings containing only whitespace.

```ts
// 👍
nonEmptyString.verify('hello world') === 'hello world';
nonEmptyString.verify('🚀') === '🚀';

// 👎
nonEmptyString.verify(123);   // throws
nonEmptyString.verify('  ');  // throws
nonEmptyString.verify('');    // throws
```

---

<a href="#regex">#</a> **regex**(pattern: <i style="color: #267f99">RegExp</i>, message: <i style="color: #267f99">string</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;string&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/strings.ts#L32-L37 'Source')
{: #regex .signature}

Accepts and returns strings that match the given regular expression.

```ts
const decoder = regex(/^[0-9][0-9]+$/, 'Must be numeric');

// 👍
decoder.verify('42') === '42';
decoder.verify('83401648364738') === '83401648364738';

// 👎
decoder.verify('');     // throws
decoder.verify('1');    // throws
decoder.verify('foo');  // throws
```

---

<a href="#decimal">#</a> **decimal**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;string&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/strings.ts#L114-L118 'Source')
{: #decimal .signature}

Accepts and returns strings with decimal digits only (base-10).
To convert these to numbers, use the [`numeric`](/api.html#numeric) decoder.

```ts
const decoder = decimal;

// 👍
decoder.verify('42') === '42';
decoder.verify('83401648364738') === '83401648364738';

// 👎
decoder.verify('');        // throws
decoder.verify('123abc');  // throws
decoder.verify('foo');     // throws
decoder.verify(123);       // throws (not a string)
```

---

<a href="#hexadecimal">#</a> **hexadecimal**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;string&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/strings.ts#L120-L126 'Source')
{: #hexadecimal .signature}

Accepts and returns strings with hexadecimal digits only (base-16).

```ts
const decoder = hexadecimal;

// 👍
decoder.verify('0123456789ABCDEF') === '0123456789ABCDEF';
decoder.verify('deadbeef') === 'deadbeef';

// 👎
decoder.verify('abcdefghijklm');  // throws (not hexadecimal)
decoder.verify('');     // throws
decoder.verify('1');    // throws
```

---

<a href="#numeric">#</a> **numeric**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;number&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/strings.ts#L128-L133 'Source')
{: #numeric .signature}

Accepts valid numerical strings (in base-10) and returns them as a number.
To only accept numerical strings and keep them as string values, use the
[`decimal`](/api.html#decimal) decoder.

```ts
const decoder = numeric;

// 👍
decoder.verify('42') === 42;
decoder.verify('83401648364738') === 83401648364738;

// 👎
decoder.verify('');        // throws
decoder.verify('123abc');  // throws
decoder.verify('foo');     // throws
decoder.verify(123);       // throws (not a string)
```

---

<a href="#email">#</a> **email**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;string&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/strings.ts#L39-L47 'Source')
{: #email .signature}

Accepts and returns strings that are syntactically valid email addresses.
(This will not mean that the email address actually exist.)

```ts
// 👍
email.verify('alice@acme.org') === 'alice@acme.org';

// 👎
email.verify('foo');               // throws
email.verify('@acme.org');         // throws
email.verify('alice @ acme.org');  // throws
```

---

<a href="#url">#</a> **url**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;URL&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/strings.ts#L49-L55 'Source')
{: #url .signature}

Accepts strings that are valid URLs, returns the value as a URL instance.

```ts
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

---

<a href="#httpsUrl">#</a> **httpsUrl**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;URL&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/strings.ts#L57-L64 'Source')
{: #httpsUrl .signature}

Accepts strings that are valid URLs, but only HTTPS ones. Returns the value
as a URL instance.

```ts
// 👍
httpsUrl.verify('https://nvie.com:443') === new URL('https://nvie.com/');

// 👎
httpsUrl.verify('http://nvie.com');                        // throws, not HTTPS
httpsUrl.verify('git+ssh://user@github.com/foo/bar.git');  // throws, not HTTPS
```

**Tip!** If you need to limit URLs to different protocols than HTTP, you can do as the HTTPS decoder is implemented: by adding further conditions using an [`.refine()`](/Decoder.html#refine) call.

```ts
import { url } from 'decoders';

const gitUrl: Decoder<URL> = url.refine(
  (value) => value.protocol === 'git:',
  'Must be a git:// URL',
);
```

---

<a href="#identifier">#</a> **identifier**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;string&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/strings.ts#L66-L73 'Source')
{: #identifier .signature}

Accepts and returns strings that are valid identifiers in most programming
languages.

```ts
// 👍
identifier.verify('x') === 'x'
identifier.verify('abc123') === 'abc123'
identifier.verify('_123') === '_123'
identifier.verify('a_b_c_1_2_3') === 'a_b_c_1_2_3'

// 👎
identifier.verify('123xyz');   // cannot start with digit
identifier.verify('x-y');      // invalid chars
identifier.verify('!@#$%^&*()=+');  // invalid chars
identifier.verify('🤯');       // invalid chars
identifier.verify(42);         // not a string
```

---

<a href="#nanoid">#</a> **nanoid**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;string&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/strings.ts#L75-L84 'Source')
{: #nanoid .signature}

Accepts and returns [nanoid](https://zelark.github.io/nano-id-cc) string
values. It assumes the default nanoid alphabet. If you're using a custom
alphabet, use [`regex()`](/api.html#regex) instead.

```ts
// 👍
nanoid().verify('1-QskICa3CaPGcKuYYTm1') === '1-QskICa3CaPGcKuYYTm1'
nanoid().verify('vA4mt7CUWnouU6jTGbMP_') === 'vA4mt7CUWnouU6jTGbMP_'
nanoid({ size: 7 }).verify('yH8mx-7') === 'yH8mx-7'
nanoid({ min: 7, max: 10 }).verify('yH8mx-7') === 'yH8mx-7'
nanoid({ min: 7, max: 10 }).verify('yH8mx-7890') === 'yH8mx-7890'

// 👎
nanoid().verify('123E4567E89B12D3A456426614174000'); // too long
nanoid().verify('abcdefghijkl');                     // too short
nanoid().verify('$*&(#%*&(');                        // invalid chars
```

---

<a href="#uuid">#</a> **uuid**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;string&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/strings.ts#L86-L94 'Source')
{: #uuid .signature}

Accepts strings that are valid
[UUIDs](https://en.wikipedia.org/wiki/universally_unique_identifier)
(universally unique identifier).

```ts
// 👍
uuid.verify('123e4567-e89b-12d3-a456-426614174000') === '123e4567-e89b-12d3-a456-426614174000'
uuid.verify('123E4567-E89B-12D3-A456-426614174000') === '123E4567-E89B-12D3-A456-426614174000'

// 👎
uuid.verify('123E4567E89B12D3A456426614174000');      // throws
uuid.verify('abcdefgh-ijkl-mnop-qrst-uvwxyz012345');  // throws
```

---

<a href="#uuidv1">#</a> **uuidv1**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;URL&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/strings.ts#L96-L103 'Source')
{: #uuidv1 .signature}

Like [`uuid`](/api.html#uuid), but only accepts
[UUIDv1](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_1_%28date-time_and_MAC_address%29)
strings.

```ts
// 👍
uuidv1.verify('123e4567-e89b-12d3-a456-426614174000') === '123e4567-e89b-42d3-a456-426614174000'

// 👎
uuidv1.verify('123e4567-e89b-42d3-a456-426614174000')  // throws
```

---

<a href="#uuidv4">#</a> **uuidv4**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;URL&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/strings.ts#L105-L112 'Source')
{: #uuidv4 .signature}

Like [`uuid`](/api.html#uuid), but only accepts
[UUIDv4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_%28random%29)
strings.

```ts
// 👍
uuidv4.verify('123e4567-e89b-42d3-a456-426614174000') === '123e4567-e89b-42d3-a456-426614174000'

// 👎
uuidv4.verify('123e4567-e89b-12d3-a456-426614174000')  // throws
```

---

## Numbers


- [`number`](/api.html#number)
- [`integer`](/api.html#integer)
- [`positiveNumber`](/api.html#positiveNumber)
- [`positiveInteger`](/api.html#positiveInteger)
- [`anyNumber`](/api.html#anyNumber)
- [`bigint`](/api.html#bigint)

---

<a href="#number">#</a> **number**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;number&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/numbers.ts#L16-L23 'Source')
{: #number .signature}

Accepts finite numbers (can be integer or float values). Values `NaN`,
or positive and negative `Infinity` will get rejected.

```ts
// 👍
number.verify(123) === 123;
number.verify(-3.14) === -3.14;

// 👎
number.verify(Infinity);        // throws
number.verify(NaN);             // throws
number.verify('not a number');  // throws
```

---

<a href="#integer">#</a> **integer**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;number&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/numbers.ts#L25-L31 'Source')
{: #integer .signature}

Accepts only finite whole numbers.

```ts
// 👍
integer.verify(123) === 123;

// 👎
integer.verify(-3.14);           // throws
integer.verify(Infinity);        // throws
integer.verify(NaN);             // throws
integer.verify('not a integer'); // throws
```

---

<a href="#positiveNumber">#</a> **positiveNumber**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;number&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/numbers.ts#L33-L39 'Source')
{: #positiveNumber .signature}

Accepts only non-negative (zero or positive) finite numbers.

```ts
// 👍
positiveNumber.verify(123) === 123;
positiveNumber.verify(0) === 0;

// 👎
positiveNumber.verify(-42);             // throws
positiveNumber.verify(3.14);            // throws
positiveNumber.verify(Infinity);        // throws
positiveNumber.verify(NaN);             // throws
positiveNumber.verify('not a number');  // throws
positiveNumber.verify(-0);              // throws
```

---

<a href="#positiveInteger">#</a> **positiveInteger**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;number&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/numbers.ts#L41-L47 'Source')
{: #positiveInteger .signature}

Accepts only non-negative (zero or positive) finite whole numbers.

```ts
// 👍
positiveInteger.verify(123) === 123;
positiveInteger.verify(0) === 0;

// 👎
positiveInteger.verify(-3);              // throws
positiveInteger.verify(3.14);            // throws
positiveInteger.verify(Infinity);        // throws
positiveInteger.verify(NaN);             // throws
positiveInteger.verify('not a number');  // throws
positiveInteger.verify(-0);              // throws
```

---

<a href="#anyNumber">#</a> **anyNumber**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;number&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/numbers.ts#L5-L14 'Source')
{: #anyNumber .signature}

Accepts any valid ``number`` value.

This also accepts special values like `NaN` and `Infinity`. Unless you
want to deliberately accept those, you'll likely want to use the
[`number`](/api.html#number) decoder instead.

```ts
// 👍
anyNumber.verify(123) === 123;
anyNumber.verify(-3.14) === -3.14;
anyNumber.verify(Infinity) === Infinity;
anyNumber.verify(NaN) === NaN;

// 👎
anyNumber.verify('not a number');  // throws
```

---

<a href="#bigint">#</a> **bigint**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;bigint&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/numbers.ts#L49-L54 'Source')
{: #bigint .signature}

Accepts any valid ``bigint`` value.

```ts
// 👍
bigint.verify(123n) === 123n;
bigint.verify(-4543000000n) === -4543000000n;

// 👎
bigint.verify(123);             // throws
bigint.verify(-3.14);           // throws
bigint.verify(Infinity);        // throws
bigint.verify(NaN);             // throws
bigint.verify('not a number');  // throws
```

---

## Booleans


- [`boolean`](/api.html#boolean)
- [`truthy`](/api.html#truthy)

---

<a href="#boolean">#</a> **boolean**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;boolean&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/booleans.ts#L4-L9 'Source')
{: #boolean .signature}

Accepts and returns booleans.

```ts
// 👍
boolean.verify(false) === false;
boolean.verify(true) === true;

// 👎
boolean.verify(undefined);      // throws
boolean.verify('hello world');  // throws
boolean.verify(123);            // throws
```

---

<a href="#truthy">#</a> **truthy**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;boolean&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/booleans.ts#L11-L14 'Source')
{: #truthy .signature}

Accepts anything and will return its "truth" value. Will never reject.

```ts
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

## Dates


- [`date`](/api.html#date)
- [`iso8601`](/api.html#iso8601)
- [`datelike`](/api.html#datelike)

---

<a href="#date">#</a> **date**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;Date&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/dates.ts#L14-L19 'Source')
{: #date .signature}

Accepts and returns `Date` instances.

```ts
const now = new Date();

// 👍
date.verify(now) === now;

// 👎
date.verify(123);      // throws
date.verify('hello');  // throws
```

---

<a href="#iso8601">#</a> **iso8601**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;Date&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/dates.ts#L21-L39 'Source')
{: #iso8601 .signature}

Accepts [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)-formatted strings,
returns them as `Date` instances.

This is very useful for working with dates in APIs: serialize them as
`.toISOString()` when sending, decode them with [`iso8601`](/api.html#iso8601) when receiving.

```ts
// 👍
iso8601.verify('2020-06-01T12:00:00Z'); // new Date('2020-06-01T12:00:00Z')

// 👎
iso8601.verify('2020-06-01');  // throws
iso8601.verify('hello');       // throws
iso8601.verify(123);           // throws
iso8601.verify(new Date());    // throws (does not accept dates)
```

---

<a href="#datelike">#</a> **datelike**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;Date&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/dates.ts#L41-L46 'Source')
{: #datelike .signature}

Accepts either a Date, or an ISO date string, returns a Date instance.
This is commonly useful to build decoders that can be reused to validate
object with Date instances as well as objects coming from JSON payloads.

```ts
// 👍
datelike.verify('2024-01-08T12:00:00Z'); // strings...
datelike.verify(new Date());             // ...or Date instances

// 👎
datelike.verify('2020-06-01');  // throws
datelike.verify('hello');       // throws
datelike.verify(123);           // throws
```

---

## Constants


- [`constant()`](/api.html#constant)
- [`always()`](/api.html#always)
- [`hardcoded()`](/api.html#hardcoded) (alias of [`always()`](/api.html#always))

---

<a href="#constant">#</a> **constant**&lt;<i style="color: #267f99">T</i>&gt;(value: <i style="color: #267f99">T</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/basics.ts#L91-L100 'Source')
{: #constant .signature}

Accepts only the given constant value.

```ts
const decoder = constant('hello');

// 👍
decoder.verify('hello') === 'hello';

// 👎
decoder.verify('this breaks');  // throws
decoder.verify(false);          // throws
decoder.verify(undefined);      // throws
```

---

<a href="#always">#</a> **always**&lt;<i style="color: #267f99">T</i>&gt;(value: <i style="color: #267f99">T</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/basics.ts#L102-L116 'Source')
{: #always .signature}

<a href="#hardcoded">#</a> **hardcoded**&lt;<i style="color: #267f99">T</i>&gt;(value: <i style="color: #267f99">T</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/basics.ts#L131-L136 'Source')
{: #hardcoded .signature}

Accepts anything, completely ignores it, and always returns the provided
value instead.

This is useful to manually add extra fields to object decoders.

```ts
const decoder = always(42);

// 👍
decoder.verify('hello') === 42;
decoder.verify(false) === 42;
decoder.verify(undefined) === 42;

// 👎
// This decoder will never reject an input
```

Or use it with a function instead of a constant:

```ts
const now = always(() => new Date());

now.verify('dummy');  // e.g. new Date('2022-02-07T09:36:58.848Z')
```

---

## Optionality


- [`null_`](/api.html#null_)
- [`undefined_`](/api.html#undefined_)
- [`optional()`](/api.html#optional)
- [`nullable()`](/api.html#nullable)
- [`nullish()`](/api.html#nullish)
- [`unknown`](/api.html#unknown)
- [`maybe()`](/api.html#maybe) (alias of [`nullish()`](/api.html#nullish))
- [`mixed`](/api.html#mixed) (alias of [`unknown`](/api.html#unknown))

---

<a href="#null_">#</a> **null_**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;null&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/basics.ts#L12-L15 'Source')
{: #null_ .signature}

Accepts and returns only the literal `null` value.

```ts
// 👍
null_.verify(null) === null;

// 👎
null_.verify(false);         // throws
null_.verify(undefined);     // throws
null_.verify('hello world'); // throws
```

---

<a href="#undefined_">#</a> **undefined_**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;undefined&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/basics.ts#L17-L20 'Source')
{: #undefined_ .signature}

Accepts and returns only the literal `undefined` value.

```ts
// 👍
undefined_.verify(undefined) === undefined;

// 👎
undefined_.verify(null);          // throws
undefined_.verify(false);         // throws
undefined_.verify('hello world'); // throws
```

---

<a href="#optional">#</a> **optional**&lt;<i style="color: #267f99">T</i>&gt;(decoder: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T | undefined&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/basics.ts#L27-L44 'Source')
{: #optional .signature}

<a href="#optional">#</a> **optional**&lt;<i style="color: #267f99">T</i>, <i style="color: #267f99">V</i>&gt;(decoder: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i>, defaultValue: <i style="color: #267f99">V | (() =&gt; V)</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T | V&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/basics.ts#L27-L44 'Source')
{: #optional .signature}

Accepts whatever the given decoder accepts, or `undefined`.

If a default value is explicitly provided, return that instead in the
`undefined` case.

```ts
const decoder = optional(string);

// 👍
decoder.verify('hello') === 'hello';
decoder.verify(undefined) === undefined;

// 👎
decoder.verify(null);  // throws
decoder.verify(0);     // throws
decoder.verify(42);    // throws
```

A typical case where [`optional()`](/api.html#optional) is useful is in decoding objects with optional fields:

```ts
object({
  id: number,
  name: string,
  address: optional(string),
});
```

Which will decode to type:

```ts
{
  id: number;
  name: string;
  address?: string;
}
```

---

<a href="#nullable">#</a> **nullable**&lt;<i style="color: #267f99">T</i>&gt;(decoder: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T | null&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/basics.ts#L46-L63 'Source')
{: #nullable .signature}

<a href="#nullable">#</a> **nullable**&lt;<i style="color: #267f99">T</i>, <i style="color: #267f99">V</i>&gt;(decoder: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i>, defaultValue: <i style="color: #267f99">V | (() =&gt; V)</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T | V&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/basics.ts#L46-L63 'Source')
{: #nullable .signature}

Accepts whatever the given decoder accepts, or `null`.

If a default value is explicitly provided, return that instead in the `null`
case.

```ts
const decoder = nullable(string);

// 👍
decoder.verify('hello') === 'hello';
decoder.verify(null) === null;

// 👎
decoder.verify(undefined);  // throws
decoder.verify(0);          // throws
decoder.verify(42);         // throws
```

Or use it with a default value:

```ts
const decoder = nullable(iso8601, () => new Date());

decoder.verify('2022-01-01T12:00:00Z') === '2022-01-01T12:00:00Z';
decoder.verify(null);  // the current date
```

---

<a href="#nullish">#</a> **nullish**&lt;<i style="color: #267f99">T</i>&gt;(decoder: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T | null | undefined&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/basics.ts#L72-L89 'Source')
{: #nullish .signature}

<a href="#nullish">#</a> **nullish**&lt;<i style="color: #267f99">T</i>, <i style="color: #267f99">V</i>&gt;(decoder: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i>, defaultValue: <i style="color: #267f99">V | (() =&gt; V)</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T | V&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/basics.ts#L72-L89 'Source')
{: #nullish .signature}

<a href="#maybe">#</a> **maybe**&lt;<i style="color: #267f99">T</i>&gt;(decoder: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T | null | undefined&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/basics.ts#L65-L70 'Source')
{: #maybe .signature}

<a href="#maybe">#</a> **maybe**&lt;<i style="color: #267f99">T</i>, <i style="color: #267f99">V</i>&gt;(decoder: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i>, defaultValue: <i style="color: #267f99">V | (() =&gt; V)</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T | V&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/basics.ts#L65-L70 'Source')
{: #maybe .signature}

Accepts whatever the given decoder accepts, or `null`, or `undefined`.

If a default value is explicitly provided, return that instead in the
`null`/`undefined` case.

```ts
const decoder = nullish(string);

// 👍
decoder.verify('hello') === 'hello';
decoder.verify(null) === null;
decoder.verify(undefined) === undefined;

// 👎
decoder.verify(0);   // throws
decoder.verify(42);  // throws
```

Or use it with a default value:

```ts
const decoder = nullish(string, null);

decoder.verify('hello') === 'hello';
decoder.verify(null) === null;
decoder.verify(undefined) === null;
```

---

<a href="#unknown">#</a> **unknown**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;unknown&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/basics.ts#L138-L145 'Source')
{: #unknown .signature}

<a href="#mixed">#</a> **mixed**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;unknown&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/basics.ts#L147-L152 'Source')
{: #mixed .signature}

Accepts anything and returns it unchanged.

Useful for situation in which you don't know or expect a specific type. Of
course, the downside is that you won't know the type of the value statically
and you'll have to further refine it yourself.

```ts
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


- [`array()`](/api.html#array)
- [`nonEmptyArray()`](/api.html#nonEmptyArray)
- [`poja`](/api.html#poja)
- [`tuple()`](/api.html#tuple)

---

<a href="#array">#</a> **array**(decoder: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T[]&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/arrays.ts#L52-L61 'Source')
{: #array .signature}

Accepts arrays of whatever the given decoder accepts.

```ts
const decoder = array(string);

// 👍
decoder.verify(['hello', 'world']) === ['hello', 'world'];
decoder.verify([]) === [];

// 👎
decoder.verify(['hello', 1.2]);  // throws
```

---

<a href="#nonEmptyArray">#</a> **nonEmptyArray**(decoder: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;[T, ...T[]]&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/arrays.ts#L67-L72 'Source')
{: #nonEmptyArray .signature}

Like [`array()`](/api.html#array), but will reject arrays with 0 elements.

```ts
const decoder = nonEmptyArray(string);

// 👍
decoder.verify(['hello', 'world']) === ['hello', 'world'];

// 👎
decoder.verify(['hello', 1.2]);  // throws
decoder.verify([]);              // throws
```

---

<a href="#poja">#</a> **poja**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;unknown[]&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/arrays.ts#L4-L14 'Source')
{: #poja .signature}

Accepts any array, but doesn't validate its items further.

"poja" means "plain old JavaScript array", a play on [`pojo`](/api.html#pojo).

```ts
// 👍
poja.verify([1, 'hi', true]) === [1, 'hi', true];
poja.verify(['hello', 'world']) === ['hello', 'world'];
poja.verify([]) === [];

// 👎
poja.verify({});    // throws
poja.verify('hi');  // throws
```

---

<a href="#tuple">#</a> **tuple**&lt;<i style="color: #267f99">A</i>, <i style="color: #267f99">B</i>, <i style="color: #267f99">...</i>&gt;(<i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;A&gt;</i>, <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;B&gt;</i>, <i style="color: #267f99">...</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;[A, B, ...]&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/arrays.ts#L81-L110 'Source')
{: #tuple .signature}

Accepts a tuple (an array with exactly _n_ items) of values accepted by the
_n_ given decoders.

```ts
const decoder = tuple(string, number);

// 👍
decoder.verify(['hello', 1.2]) === ['hello', 1.2];

// 👎
decoder.verify([]);                  // throws, too few items
decoder.verify(['hello', 'world']);  // throws, not the right types
decoder.verify(['a', 1, 'c']);       // throws, too many items
```

---

## Objects


- [`object()`](/api.html#object)
- [`exact()`](/api.html#exact)
- [`inexact()`](/api.html#inexact)
- [`pojo`](/api.html#pojo)

---

<a href="#object">#</a> **object**&lt;<i style="color: #267f99">A</i>, <i style="color: #267f99">B</i>, <i style="color: #267f99">...</i>&gt;(<i style="color: #267f99">{ field1: <a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;A&gt;, field2: <a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;B&gt;, ... }</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;{ field1: A, field2: B, ... }&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/objects.ts#L55-L138 'Source')
{: #object .signature}

Accepts objects with fields matching the given decoders. Extra fields that
exist on the input object are ignored and will not be returned.

```ts
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

For more information, see also [The difference between ``object``, ``exact``, and ``inexact``](./tips.html#the-difference-between-object-exact-and-inexact).

---

<a href="#exact">#</a> **exact**&lt;<i style="color: #267f99">A</i>, <i style="color: #267f99">B</i>, <i style="color: #267f99">...</i>&gt;(<i style="color: #267f99">{ field1: <a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;A&gt;, field2: <a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;B&gt;, ... }</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;{ field1: A, field2: B, ... }&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/objects.ts#L140-L165 'Source')
{: #exact .signature}

Like [`object()`](/api.html#object), but will reject inputs that contain extra fields that are
not specified explicitly.

```ts
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

For more information, see also [The difference between ``object``, ``exact``, and ``inexact``](./tips.html#the-difference-between-object-exact-and-inexact).

---

<a href="#inexact">#</a> **inexact**&lt;<i style="color: #267f99">A</i>, <i style="color: #267f99">B</i>, <i style="color: #267f99">...</i>&gt;(<i style="color: #267f99">{ field1: <a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;A&gt;, field2: <a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;B&gt;, ... }</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;{ field1: A, field2: B, ... }&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/objects.ts#L167-L202 'Source')
{: #inexact .signature}

Like [`object()`](/api.html#object), but will pass through any extra fields on the input object
unvalidated that will thus be of [`unknown`](/api.html#unknown) type statically.

```ts
const decoder = inexact({
  x: number,
  y: number,
});

// 👍
decoder.verify({ x: 1, y: 2 }) === { x: 1, y: 2 };
decoder.verify({ x: 1, y: 2, z: 3 }) === { x: 1, y: 2, z: 3 };

// 👎
decoder.verify({ x: 1 });  // throws, missing field `y`
```

For more information, see also [The difference between ``object``, ``exact``, and ``inexact``](./tips.html#the-difference-between-object-exact-and-inexact).

---

<a href="#pojo">#</a> **pojo**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;Record&lt;string, unknown&gt;&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/objects.ts#L47-L53 'Source')
{: #pojo .signature}

Accepts any "plain old JavaScript object", but doesn't validate its keys or
values further.

```ts
// 👍
pojo.verify({}) === {};
pojo.verify({ name: 'hi' }) === { name: 'hi' };

// 👎
pojo.verify('hi');        // throws
pojo.verify([]);          // throws
pojo.verify(new Date());  // throws
pojo.verify(null);        // throws
```

---

## Collections


- [`record()`](/api.html#record)
- [`dict()`](/api.html#dict)
- [`mapping()`](/api.html#mapping)
- [`setFromArray()`](/api.html#setFromArray)
- [`set()`](/api.html#set)

---

<a href="#record">#</a> **record**&lt;<i style="color: #267f99">V</i>&gt;(values: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;V&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;Record&lt;string, V&gt;&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/collections.ts#L8-L57 'Source')
{: #record .signature}

<a href="#record">#</a> **record**&lt;<i style="color: #267f99">K</i>, <i style="color: #267f99">V</i>&gt;(keys: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;K&gt;</i>, values: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;V&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;Record&lt;K, V&gt;&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/collections.ts#L8-L57 'Source')
{: #record .signature}

Accepts objects where all values match the given decoder, and returns the
result as a `Record<string, V>`.

This is useful to validate inputs like `{ [key: string]: V }`.

#### Decoding values only

The default call takes a single argument and will validate all _values_.
For example, to validate that all values in the object are numbers:

```ts
const decoder = record(number);
//                        \ 
//                      Values must be numbers

// 👍
decoder.verify({ red: 1, blue: 2, green: 3 });

// 👎
decoder.verify({ hi: 'not a number' });
```

#### Decoding keys and values

If you also want to validate that keys are of a specific form, use the
two-argument form: `record(key, value)`. Note that the given key decoder
must return strings.

For example, to enforce that all keys are emails:

```ts
const decoder = record(email, number);
//                      /        \ 
//              Keys must        Values must
//             be emails           be numbers

// 👍
decoder.verify({ "me@nvie.com": 1 });

// 👎
decoder.verify({ "no-email": 1 });
```

---

<a href="#dict">#</a> **dict**&lt;<i style="color: #267f99">V</i>&gt;(decoder: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;Record&lt;string, V&gt;&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/collections.ts#L59-L64 'Source')
{: #dict .signature}

Alias of [`record()`](/api.html#record).

---

<a href="#mapping">#</a> **mapping**&lt;<i style="color: #267f99">T</i>&gt;(decoder: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;Map&lt;string, T&gt;&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/collections.ts#L82-L89 'Source')
{: #mapping .signature}

Similar to [`record()`](/api.html#record), but returns the result as a `Map<string, T>` (an [ES6
Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map))
instead.

```ts
const decoder = mapping(number);

// 👍
decoder.verify({ red: 1, blue: 2, green: 3 });
// Map([
//   ['red', '1'],
//   ['blue', '2'],
//   ['green', '3'],
// ]);
```

---

<a href="#setFromArray">#</a> **setFromArray**&lt;<i style="color: #267f99">T</i>&gt;(decoder: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;Set&lt;T&gt;&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/collections.ts#L66-L72 'Source')
{: #setFromArray .signature}

Similar to [`array()`](/api.html#array), but returns the result as an [ES6
Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).

```ts
const decoder = set(string);

// 👍
decoder.verify(['abc', 'pqr'])  // new Set(['abc', 'pqr'])
decoder.verify([])              // new Set([])

// 👎
decoder.verify([1, 2]);         // throws, not the right types
```

---

<a href="#set">#</a> **set**&lt;<i style="color: #267f99">T</i>&gt;(decoder: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;Set&lt;T&gt;&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/collections.ts#L74-L80 'Source')
{: #set .signature}

An alias of [`setFromArray()`](/api.html#setFromArray).

⚠️ **IMPORTANT!** This decoder will change its behavior in a future
version! If you rely on this decoder, use [`setFromArray()`](/api.html#setFromArray) instead.

---

## JSON values


- [`json`](/api.html#json)
- [`jsonObject`](/api.html#jsonObject)
- [`jsonArray`](/api.html#jsonArray)

---

<a href="#json">#</a> **json**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;JSONValue&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/json.ts#L26-L49 'Source')
{: #json .signature}

Accepts any value that's a valid JSON value.

In other words: any value returned by `JSON.parse()` should decode without
failure.

```typescript
type JSONValue =
    | null
    | string
    | number
    | boolean
    | { [string]: JSONValue }
    | JSONValue[]
```

```ts
// 👍
json.verify({
  name: 'Amir',
  age: 27,
  admin: true,
  image: null,
  tags: ['vip', 'staff'],
});
```

---

<a href="#jsonObject">#</a> **jsonObject**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;{ [string]: JSONValue }&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/json.ts#L16-L19 'Source')
{: #jsonObject .signature}

Accepts objects that contain only valid JSON values.

```ts
// 👍
jsonObject.verify({});                // {}
jsonObject.verify({ name: 'Amir' });  // { name: 'Amir' }

// 👎
jsonObject.verify([]);                   // throws
jsonObject.verify([{ name: 'Alice' }]);  // throws
jsonObject.verify('hello');              // throws
jsonObject.verify(null);                 // throws
```

---

<a href="#jsonArray">#</a> **jsonArray**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;JSONValue[]&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/json.ts#L21-L24 'Source')
{: #jsonArray .signature}

Accepts arrays that contain only valid JSON values.

```ts
// 👍
jsonArray.verify([]);                  // []
jsonArray.verify([{ name: 'Amir' }]);  // [{ name: 'Amir' }]

// 👎
jsonArray.verify({});                 // throws
jsonArray.verify({ name: 'Alice' });  // throws
jsonArray.verify('hello');            // throws
jsonArray.verify(null);               // throws
```

---

## Unions


- [`either()`](/api.html#either)
- [`oneOf()`](/api.html#oneOf)
- [`enum_()`](/api.html#enum_)
- [`taggedUnion()`](/api.html#taggedUnion)
- [`select()`](/api.html#select)

---

<a href="#either">#</a> **either**&lt;<i style="color: #267f99">A</i>, <i style="color: #267f99">B</i>, <i style="color: #267f99">...</i>&gt;(<i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;A&gt;</i>, <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;B&gt;</i>, <i style="color: #267f99">...</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;A | B | ...&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/unions.ts#L50-L83 'Source')
{: #either .signature}

Accepts values accepted by any of the given decoders.

The decoders are tried on the input one by one, in the given order. The
first one that accepts the input "wins". If all decoders reject the input,
the input gets rejected.

```ts
const decoder = either(number, string);

// 👍
decoder.verify('hello world') === 'hello world';
decoder.verify(123) === 123;

// 👎
decoder.verify(false);  // throws
```

---

<a href="#oneOf">#</a> **oneOf**&lt;<i style="color: #267f99">T</i>&gt;(values: <i style="color: #267f99">T[]</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/unions.ts#L85-L97 'Source')
{: #oneOf .signature}

Accepts any value that is strictly-equal (using `===`) to one of the
specified values.

```ts
const decoder = oneOf(['foo', 'bar', 3]);

// 👍
decoder.verify('foo') === 'foo';
decoder.verify(3) === 3;

// 👎
decoder.verify('hello');  // throws
decoder.verify(4);        // throws
decoder.verify(false);    // throws
```

For example, given an array of strings, like so:

```ts
oneOf(['foo', 'bar']);
```

---

<a href="#enum_">#</a> **enum_**(enum: <i style="color: #267f99">MyEnum</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;MyEnum&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/unions.ts#L99-L120 'Source')
{: #enum_ .signature}

Accepts and return an enum value.

It works with numeric enums:

```ts
enum Fruit {
  Apple,
  Banana,
  Cherry
}

const decoder = enum_(Fruit);

// 👍
decoder.verify(Fruit.Apple) === Fruit.Apple;
decoder.verify(Fruit.Banana) === Fruit.Banana;
decoder.verify(Fruit.Cherry) === Fruit.Cherry;
decoder.verify(0) === Fruit.Apple;
decoder.verify(1) === Fruit.Banana;
decoder.verify(2) === Fruit.Cherry;

// 👎
decoder.verify('Apple');  // throws
decoder.verify(-1);       // throws
decoder.verify(3);        // throws
```

As well as with string enums:

```ts
enum Fruit {
  Apple = 'a',
  Banana = 'b',
  Cherry = 'c'
}

const decoder = enum_(Fruit);

// 👍
decoder.verify(Fruit.Apple) === Fruit.Apple;
decoder.verify(Fruit.Banana) === Fruit.Banana;
decoder.verify(Fruit.Cherry) === Fruit.Cherry;
decoder.verify('a') === Fruit.Apple;
decoder.verify('b') === Fruit.Banana;
decoder.verify('c') === Fruit.Cherry;

// 👎
decoder.verify('Apple');  // throws
decoder.verify(0);        // throws
decoder.verify(1);        // throws
decoder.verify(2);        // throws
decoder.verify(3);        // throws
```

---

<a href="#taggedUnion">#</a> **taggedUnion**&lt;<i style="color: #267f99">A</i>, <i style="color: #267f99">B</i>, <i style="color: #267f99">...</i>&gt;(field: <i style="color: #267f99">string</i>, mapping: <i style="color: #267f99">{ value1: <a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;A&gt;, value2: <a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;B&gt;, ... }</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;A | B | ...&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/unions.ts#L122-L161 'Source')
{: #taggedUnion .signature}

If you are decoding tagged unions you may want to use the [`taggedUnion()`](/api.html#taggedUnion)
decoder instead of the general purpose [`either()`](/api.html#either) decoder to get better
error messages and better performance.

This decoder is optimized for [tagged
unions](https://en.wikipedia.org/wiki/Tagged_union), i.e. a union of
objects where one field is used as the discriminator.

```ts
const A = object({ tag: constant('A'), foo: string });
const B = object({ tag: constant('B'), bar: number });

const AorB = taggedUnion('tag', { A, B });
//                        ^^^
```

Decoding now works in two steps:

1. Look at the `'tag'` field in the incoming object (this is the field
   that decides which decoder will be used)
2. If the value is `'A'`, then decoder `A` will be used. If it's `'B'`, then
   decoder `B` will be used. Otherwise, this will fail.

This is effectively equivalent to `either(A, B)`, but will provide better
error messages and is more performant at runtime because it doesn't have to
try all decoders one by one.

---

<a href="#select">#</a> **select**&lt;<i style="color: #267f99">T</i>, <i style="color: #267f99">A</i>, <i style="color: #267f99">B</i>, <i style="color: #267f99">...</i>&gt;(scout: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i>, selectFn: <i style="color: #267f99">(result: T) =&gt; <a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;A&gt; | <a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;B&gt; | ...</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;A | B | ...&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/unions.ts#L163-L180 'Source')
{: #select .signature}

Briefly peek at a runtime input using a "scout" decoder first, then decide
which decoder to run on the (original) input, based on the information that
the "scout" extracted.

It serves a similar purpose as [`taggedUnion()`](/api.html#taggedUnion), but is a generalization that
works even if there isn't a single discriminator, or the discriminator isn't
a string.

```ts
const decoder = select(
  // First, validate/extract the minimal information to make a decision
  object({ version: optional(number) }),

  // Then select which decoder to run
  (obj) => {
    switch (obj.version) {
      case undefined: return v1Decoder; // Suppose v1 doesn't have a discriminating field
      case 2:         return v2Decoder;
      case 3:         return v3Decoder;
      default:        return never('Invalid version');
    }
  },
);
// Decoder<V1 | V2 | V3>
```

---

## Utilities


- [`define()`](/api.html#define)
- [`prep()`](/api.html#prep)
- [`never`](/api.html#never)
- [`instanceOf()`](/api.html#instanceOf)
- [`lazy()`](/api.html#lazy)
- [`fail`](/api.html#fail) (alias of [`never`](/api.html#never))

---

<a href="#define">#</a> **define**&lt;<i style="color: #267f99">T</i>&gt;(fn: <i style="color: #267f99">(blob: unknown, ok, err) =&gt; DecodeResult&lt;T&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/Decoder.ts#L147-L316 'Source')
{: #define .signature}

Defines a new `Decoder<T>`, by implementing a custom acceptance function.
The function receives three arguments:

1. `blob` - the raw/unknown input (aka your external data)
2. `ok` - Call `ok(value)` to accept the input and return ``value``
3. `err` - Call `err(message)` to reject the input with error ``message``

The expected return value should be a `DecodeResult<T>`, which can be
obtained by returning the result of calling the provided `ok` or `err`
helper functions. Please note that `ok()` and `err()` don't perform side
effects! You'll need to _return_ those values.

> _**NOTE:** This is the lowest-level API to define a new decoder, and therefore not recommended unless you have a very good reason for it. Most cases can be covered more elegantly by starting from an existing decoder and using [`.transform()`](/Decoder.html#transform) or [`.refine()`](/Decoder.html#refine) on them instead._

```ts
// NOTE: Please do NOT implement an uppercase decoder like this! 😇
const uppercase: Decoder<string> = define(
  (blob, ok, err) => {
    if (typeof blob === 'string') {
      // Accept the input
      return ok(blob.toUpperCase());
    } else {
      // Reject the input
      return err('I only accept strings as input');
    }
  }
);

// 👍
uppercase.verify('hi there') === 'HI THERE';

// 👎
uppercase.verify(123);   // throws: 123
                         //         ^^^ I only accept strings as input
```

The above example is just an example to illustrate how [`define()`](/api.html#define) works. It would be more idiomatic to implement an uppercase decoder as follows:

```ts
const uppercase: Decoder<string> = string.transform(s => s.toUpperCase());
```

---

<a href="#prep">#</a> **prep**&lt;<i style="color: #267f99">T</i>&gt;(mapperFn: <i style="color: #267f99">(raw: mixed) =&gt; mixed</i>, decoder: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/misc.ts#L29-L59 'Source')
{: #prep .signature}

Pre-process the data input before passing it into the decoder. This gives
you the ability to arbitrarily customize the input on the fly before passing
it to the decoder. Of course, the input value at that point is still of
``unknown`` type, so you will have to deal with that accordingly.

```ts
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

---

<a href="#never">#</a> **never**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;never&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/basics.ts#L118-L124 'Source')
{: #never .signature}

<a href="#fail">#</a> **fail**: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;never&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/basics.ts#L126-L129 'Source')
{: #fail .signature}

Rejects all inputs, and always fails with the given error message. May be
useful for explicitly disallowing keys, or for testing purposes.

```ts
const decoder = object({
  a: string,
  b: optional(never('Key b has been removed')),
});

// 👍
decoder.verify({ a: 'foo' });            // { a: 'foo' };
decoder.verify({ a: 'foo', c: 'bar' });  // { a: 'foo' };

// 👎
decoder.verify({ a: 'foo', b: 'bar' });  // throws
```

---

<a href="#instanceOf">#</a> **instanceOf**&lt;<i style="color: #267f99">T</i>&gt;(klass: <i style="color: #267f99">Klass&lt;T&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/misc.ts#L11-L19 'Source')
{: #instanceOf .signature}

Accepts any value that is an ``instanceof`` the given class.

```ts
const decoder = instanceOf(Error);

// 👍
const value = new Error('foo');
decoder.verify(value) === value;

// 👎
decoder.verify('foo');  // throws
decoder.verify(3);      // throws
```

---

<a href="#lazy">#</a> **lazy**&lt;<i style="color: #267f99">T</i>&gt;(decoderFn: <i style="color: #267f99">() =&gt; <a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/misc.ts#L21-L27 'Source')
{: #lazy .signature}

Lazily evaluate the given decoder. This is useful to build self-referential
types for recursive data structures.

```ts
type Tree = {
  value: string;
  children: Array<Tree>;
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

<!--[[[end]]] (checksum: f1b15961ef6fc5f0c6516084dcc4561c)-->
<!-- prettier-ignore-end -->
