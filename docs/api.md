---
title: API Reference
nav_order: 10
has_children: true
---

<!--[[[cog
import cog
import html
import re
import textwrap
from _data import (
  DECODERS,
  DECODERS_BY_SECTION,
  DECODER_METHODS,
  LOCATIONS,
)


def multi(lines, prefix = ' '):
  return ('\n' + prefix + '\n' + prefix).join([safe(p) for p in lines])


def slugify(s):
  return re.sub('[^a-z0-9]+', '-', s.lower())


def safe(s):
  return html.escape(s)


def format_type(s):
  return f'<i style="color: #267f99">{safe(s)}</i>'


def reindent(s, prefix = ''):
  return textwrap.indent(textwrap.dedent(s), prefix).strip()


def ref(name):
  decoder = DECODERS.get(name)
  if decoder is not None:
    if decoder.get('params') is not None:
      return f'[`{name}()`](#{name})'
  return f'[`{name}`](#{name})'


def methodref(name):
  return f'[`.{name}()`](#{name})'


def source_link(name):
  source = LOCATIONS.get(name)
  return f"[<small>(source)</small>]({source} 'Source')" if source else ''

]]]-->
<!--[[[end]]] (checksum: d41d8cd98f00b204e9800998ecf8427e)-->

# API Reference

<!-- prettier-ignore-start -->
<!--[[[cog
for section, names in DECODERS_BY_SECTION.items():
  cog.outl(f'- [**{section}**](#{slugify(section)}): {", ".join(ref(name) for name in names)}')
]]]-->
- [**Strings**](#strings): [`string`](#string), [`nonEmptyString`](#nonEmptyString), [`regex()`](#regex), [`email`](#email), [`url`](#url), [`httpsUrl`](#httpsUrl), [`uuid`](#uuid), [`uuidv1`](#uuidv1), [`uuidv4`](#uuidv4)
- [**Numbers**](#numbers): [`number`](#number), [`integer`](#integer), [`positiveNumber`](#positiveNumber), [`positiveInteger`](#positiveInteger)
- [**Booleans**](#booleans): [`boolean`](#boolean), [`truthy`](#truthy), [`numericBoolean`](#numericBoolean)
- [**Dates**](#dates): [`date`](#date), [`iso8601`](#iso8601)
- [**Constants**](#constants): [`constant()`](#constant), [`always()`](#always), [`hardcoded()`](#hardcoded)
- [**Optionality**](#optionality): [`null_`](#null_), [`undefined_`](#undefined_), [`optional()`](#optional), [`nullable()`](#nullable), [`maybe()`](#maybe), [`unknown`](#unknown), [`mixed`](#mixed)
- [**Arrays**](#arrays): [`array()`](#array), [`nonEmptyArray()`](#nonEmptyArray), [`poja`](#poja), [`tuple()`](#tuple), [`set()`](#set)
- [**Objects**](#objects): [`object()`](#object), [`exact()`](#exact), [`inexact()`](#inexact), [`pojo`](#pojo), [`dict()`](#dict), [`mapping()`](#mapping)
- [**JSON values**](#json-values): [`json`](#json), [`jsonObject`](#jsonObject), [`jsonArray`](#jsonArray)
- [**Choice**](#choice): [`either()`](#either), [`taggedUnion()`](#taggedUnion), [`oneOf()`](#oneOf), [`dispatch()`](#dispatch)
- [**Utilities**](#utilities): [`prep()`](#prep), [`never`](#never), [`instanceOf()`](#instanceOf), [`lazy()`](#lazy), [`fail`](#fail)
<!--[[[end]]] (checksum: 02958b7294c32fa79d9d7d9531d18e67) -->
<!-- prettier-ignore-end -->

---

## Available methods on `Decoder<T>`

<!-- prettier-ignore-start -->
<!--[[[cog
for name in DECODER_METHODS:
  cog.outl(f'- {methodref(name)}')
]]]-->
- [`.verify()`](#verify)
- [`.decode()`](#decode)
- [`.and()`](#and)
- [`.chain()`](#chain)
- [`.transform()`](#transform)
- [`.describe()`](#describe)
<!--[[[end]]] (checksum: 31cba22c90966a5e3faa6463056a50d2)-->

<!--[[[cog
for (name, info) in DECODER_METHODS.items():
  name = safe(name)
  params = '' if not info['params'] else '(' + ', '.join([f'{safe(pname)}: {format_type(ptype)}' for (pname, ptype) in info['params']]) + ')'
  type_params = '' if not info.get('type_params') else safe('<') + ', '.join([format_type(ptype) for ptype in info['type_params']]) + safe('>')
  return_type = format_type(info['return_type'])
  markdown = reindent(info['markdown'], prefix='    ')
  cog.outl(f"""
    ---

    <a name="{name}" href="#{name}">#</a>
    **.{name}**{type_params}{params}: {return_type} {source_link(name)}<br />

    {markdown}
  """, dedent=True, trimblanklines=True)
]]]-->
---

<a name="verify" href="#verify">#</a>
**.verify**(blob: <i style="color: #267f99">mixed</i>): <i style="color: #267f99">T</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/_decoder.js#L60-L69 'Source')<br />

Verified the (raw/untrusted/unknown) input and either accepts or rejects it. When accepted, returns the decoded `T` value directly. Otherwise fail with a runtime error.

For example, take this simple "number" decoder.

```typescript
// 👍
number.verify(3);     // 3

// 👎
number.verify('hi');  // throws
```

---

<a name="decode" href="#decode">#</a>
**.decode**(blob: <i style="color: #267f99">mixed</i>): <i style="color: #267f99">DecodeResult&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/_decoder.js#L56-L58 'Source')<br />

Validates the raw/untrusted/unknown input and either accepts or rejects it.

Contrasted with `.verify()`, calls to `.decode()` will never fail and instead return a result type.

For example, take this simple “number” decoder. When given an number value, it will return an ok: true result. Otherwise, it will return an ok: false result with the original input value annotated.

```typescript
// 👍
number.decode(3);     // { ok: true, value: 3 };

// 👎
number.decode('hi');  // { ok: false, error: { type: 'scalar', value: 'hi', text: 'Must be number' } }
```

---

<a name="and" href="#and">#</a>
**.and**(predicate: <i style="color: #267f99">T =&gt; boolean</i>, message: <i style="color: #267f99">string</i>): <i style="color: #267f99">Decoder&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/_decoder.js#L71-L77 'Source')<br />

Adds an extra predicate to a decoder. The new decoder is like the original decoder, but only accepts values that also meet the predicate.

```typescript
const odd = number.and(
  (n) => n % 2 !== 0,
  'Must be odd'
);

// 👍
odd.verify(3) === 3;

// 👎
odd.verify(42);    // throws: not an odd number
odd.verify('hi');  // throws: not a number
```

In TypeScript, if you provide a predicate that also is a [type predicate](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates), then this will be reflected in the return type, too.

---

<a name="chain" href="#chain">#</a>
**.chain**&lt;<i style="color: #267f99">V</i>&gt;(nextDecodeFn: <i style="color: #267f99">T =&gt; DecodeResult&lt;V&gt;</i>): <i style="color: #267f99">Decoder&lt;V&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/_decoder.js#L115-L117 'Source')<br />

Chain together the current decoder with the given decode function. The given function will only get called after the current decoder accepts an input.

The given "next" decoding function will thus be able to make more assumptions about its input value, i.e. it can know what type the input value is (`T` instead of `unknown`).

This is an advanced decoder, typically only useful for authors of decoders. It's not recommended to rely on this decoder directly for normal usage.  In most cases, [**.transform**()](#transform) is what you'll want instead.

---

<a name="transform" href="#transform">#</a>
**.transform**&lt;<i style="color: #267f99">V</i>&gt;(transformFn: <i style="color: #267f99">(T) =&gt; V</i>): <i style="color: #267f99">Decoder&lt;V&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/_decoder.js#L85-L89 'Source')<br />

Accepts any value the given decoder accepts, and on success, will call the given function **on the decoded result**. If the transformation function throws an error, the whole decoder will fail using the error message as the failure reason.

```typescript
const upper = string.transform((s) => s.toUpperCase());

// 👍
upper.verify('foo') === 'FOO'

// 👎
upper.verify(4);  // throws
```

---

<a name="describe" href="#describe">#</a>
**.describe**(message: <i style="color: #267f99">string</i>): <i style="color: #267f99">Decoder&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/_decoder.js#L91-L103 'Source')<br />

Uses the given decoder, but will use an alternative error message in case it rejects. This can be used to simplify or shorten otherwise long or low-level/technical errors.

```typescript
const decoder = either(
    constant('a'),
    constant('e'),
    constant('i'),
    constant('o'),
    constant('u'),
);
const vowel = decoder.describe('Must be vowel');
```

<!--[[[end]]] (checksum: afdd4ad30877ad4815aab50137182a6b) -->
<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->
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

    params = '' if not info['params'] else '(' + ', '.join([(f'{safe(pname)}: {format_type(ptype)}' if pname else f'{format_type(ptype)}') if ptype else f'{safe(pname)}' for (pname, ptype) in info['params']]) + ')'
    type_params = '' if not info.get('type_params') else safe('<') + ', '.join([format_type(ptype) for ptype in info['type_params']]) + safe('>')
    return_type = format_type(info['return_type'])
    markdown = reindent(info['markdown'], prefix='      ')
    source = LOCATIONS.get(name)
    heading = '  \n'.join([
      f'<a name="{name}" href="#{name}">#</a>\n**{name}**{type_params}{params}: {return_type} {source_link(name)}',
      *(f'<a name="{alias}" href="#{alias}">#</a>\n**{alias}**{type_params}{params}: {return_type} {source_link(alias)}' for alias in info.get('aliases', []))
    ])

    cog.outl('---')

    cog.outl()
    cog.outl(heading)

    cog.outl()
    cog.outl(f"""
      {markdown}
    """, dedent=True, trimblanklines=True)
    # <small><a href="#{section}">Back to section</a> | <a href="#api-reference">Back to top</a></small>
]]]-->
---

## Strings


- [`string`](#string)
- [`nonEmptyString`](#nonEmptyString)
- [`regex()`](#regex)
- [`email`](#email)
- [`url`](#url)
- [`httpsUrl`](#httpsUrl)
- [`uuid`](#uuid)
- [`uuidv1`](#uuidv1)
- [`uuidv4`](#uuidv4)

---

<a name="string" href="#string">#</a>
**string**: <i style="color: #267f99">Decoder&lt;string&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/strings.js#L23-L25 'Source')

Accepts and returns strings.

```typescript
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

<a name="nonEmptyString" href="#nonEmptyString">#</a>
**nonEmptyString**: <i style="color: #267f99">Decoder&lt;string&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/strings.js#L30 'Source')

Like `string`, but will reject the empty string or strings containing only whitespace.

```typescript
// 👍
nonEmptyString.verify('hello world') === 'hello world';
nonEmptyString.verify('🚀') === '🚀';

// 👎
nonEmptyString.verify(123);   // throws
nonEmptyString.verify('  ');  // throws
nonEmptyString.verify('');    // throws
```

---

<a name="regex" href="#regex">#</a>
**regex**(pattern: <i style="color: #267f99">RegExp</i>, message: <i style="color: #267f99">string</i>): <i style="color: #267f99">Decoder&lt;string&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/strings.js#L35-L37 'Source')

Accepts and returns strings that match the given regular expression.

```typescript
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

<a name="email" href="#email">#</a>
**email**: <i style="color: #267f99">Decoder&lt;string&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/strings.js#L43-L47 'Source')

Accepts and returns strings that are syntactically valid email addresses. (This will not mean that the email address actually exist.)

```typescript
// 👍
email.verify('alice@acme.org') === 'alice@acme.org';

// 👎
email.verify('foo');               // throws
email.verify('@acme.org');         // throws
email.verify('alice @ acme.org');  // throws
```

---

<a name="url" href="#url">#</a>
**url**: <i style="color: #267f99">Decoder&lt;URL&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/strings.js#L52-L55 'Source')

Accepts strings that are valid URLs, returns the value as a URL instance.

```typescript
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

<a name="httpsUrl" href="#httpsUrl">#</a>
**httpsUrl**: <i style="color: #267f99">Decoder&lt;URL&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/strings.js#L61-L64 'Source')

Accepts strings that are valid URLs, but only HTTPS ones. Returns the value as a URL instance.

```typescript
// 👍
httpsUrl.verify('https://nvie.com:443') === new URL('https://nvie.com/');

// 👎
httpsUrl.verify('http://nvie.com');                        // throws, not HTTPS
httpsUrl.verify('git+ssh://user@github.com/foo/bar.git');  // throws, not HTTPS
```

**Tip!** If you need to limit URLs to different protocols than HTTP, you can do as the HTTPS decoder is implemented: by adding further conditions using an [`.and()`](#and) call.

```typescript
import { url } from 'decoders';

const gitUrl: Decoder<URL> = url.and(
    (value) => value.protocol === 'git:',
    'Must be a git:// URL',
);
```

---

<a name="uuid" href="#uuid">#</a>
**uuid**: <i style="color: #267f99">Decoder&lt;string&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/strings.js#L71-L74 'Source')

Accepts strings that are valid [UUIDs](https://en.wikipedia.org/wiki/universally_unique_identifier) (universally unique identifier).

```typescript
// 👍
uuid.verify('123e4567-e89b-12d3-a456-426614174000') === '123e4567-e89b-12d3-a456-426614174000'
uuid.verify('123E4567-E89B-12D3-A456-426614174000') === '123E4567-E89B-12D3-A456-426614174000'

// 👎
uuid.verify('123E4567E89B12D3A456426614174000');      // throws
uuid.verify('abcdefgh-ijkl-mnop-qrst-uvwxyz012345');  // throws
```

---

<a name="uuidv1" href="#uuidv1">#</a>
**uuidv1**: <i style="color: #267f99">Decoder&lt;URL&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/strings.js#L81-L83 'Source')

Like `uuid`, but only accepts [UUIDv1s](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_1_%28date-time_and_MAC_address%29) strings.

```typescript
// 👍
uuidv1.verify('123e4567-e89b-12d3-a456-426614174000') === '123e4567-e89b-42d3-a456-426614174000'

// 👎
uuidv1.verify('123e4567-e89b-42d3-a456-426614174000')  // throws
```

---

<a name="uuidv4" href="#uuidv4">#</a>
**uuidv4**: <i style="color: #267f99">Decoder&lt;URL&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/strings.js#L90-L92 'Source')

Like `uuid`, but only accepts [UUIDv4s](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_%28random%29) strings.

```typescript
// 👍
uuidv4.verify('123e4567-e89b-42d3-a456-426614174000') === '123e4567-e89b-42d3-a456-426614174000'

// 👎
uuidv4.verify('123e4567-e89b-12d3-a456-426614174000')  // throws
```

---

## Numbers


- [`number`](#number)
- [`integer`](#integer)
- [`positiveNumber`](#positiveNumber)
- [`positiveInteger`](#positiveInteger)

---

<a name="number" href="#number">#</a>
**number**: <i style="color: #267f99">Decoder&lt;number&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/numbers.js#L18-L21 'Source')

Accepts finite numbers (can be integer or float values). Values `NaN`, or positive and negative `Infinity` will get rejected.

```typescript
// 👍
number.verify(123) === 123;
number.verify(-3.14) === -3.14;

// 👎
number.verify(Infinity);        // throws
number.verify(NaN);             // throws
number.verify('not a number');  // throws
```

---

<a name="integer" href="#integer">#</a>
**integer**: <i style="color: #267f99">Decoder&lt;number&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/numbers.js#L26-L29 'Source')

Accepts only finite whole numbers.

```typescript
// 👍
integer.verify(123) === 123;

// 👎
integer.verify(-3.14);           // throws
integer.verify(Infinity);        // throws
integer.verify(NaN);             // throws
integer.verify('not a integer'); // throws
```

---

<a name="positiveNumber" href="#positiveNumber">#</a>
**positiveNumber**: <i style="color: #267f99">Decoder&lt;number&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/numbers.js#L34-L37 'Source')

Accepts only positive finite numbers.

```typescript
// 👍
positiveNumber.verify(123) === 123;

// 👎
positiveNumber.verify(-42);             // throws
positiveNumber.verify(3.14);            // throws
positiveNumber.verify(Infinity);        // throws
positiveNumber.verify(NaN);             // throws
positiveNumber.verify('not a number');  // throws
```

---

<a name="positiveInteger" href="#positiveInteger">#</a>
**positiveInteger**: <i style="color: #267f99">Decoder&lt;number&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/numbers.js#L42-L45 'Source')

Accepts only positive finite whole numbers.

```typescript
// 👍
positiveInteger.verify(123) === 123;

// 👎
positiveInteger.verify(-3);              // throws
positiveInteger.verify(3.14);            // throws
positiveInteger.verify(Infinity);        // throws
positiveInteger.verify(NaN);             // throws
positiveInteger.verify('not a number');  // throws
```

---

## Booleans


- [`boolean`](#boolean)
- [`truthy`](#truthy)
- [`numericBoolean`](#numericBoolean)

---

<a name="boolean" href="#boolean">#</a>
**boolean**: <i style="color: #267f99">Decoder&lt;boolean&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/booleans.js#L12-L14 'Source')

Accepts and returns booleans.

```typescript
// 👍
boolean.verify(false) === false;
boolean.verify(true) === true;

// 👎
boolean.verify(undefined);      // throws
boolean.verify('hello world');  // throws
boolean.verify(123);            // throws
```

---

<a name="truthy" href="#truthy">#</a>
**truthy**: <i style="color: #267f99">Decoder&lt;boolean&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/booleans.js#L19 'Source')

Accepts anything and will return its "truth" value. Will never reject.

```typescript
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

<a name="numericBoolean" href="#numericBoolean">#</a>
**numericBoolean**: <i style="color: #267f99">Decoder&lt;boolean&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/booleans.js#L24 'Source')

Accepts numbers, but return their boolean representation.

```typescript
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

---

## Dates


- [`date`](#date)
- [`iso8601`](#iso8601)

---

<a name="date" href="#date">#</a>
**date**: <i style="color: #267f99">Decoder&lt;Date&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/dates.js#L37 'Source')

Accepts and returns [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) instances.

```typescript
const now = new Date();

// 👍
date.verify(now) === now;

// 👎
date.verify(123);      // throws
date.verify('hello');  // throws
```

---

<a name="iso8601" href="#iso8601">#</a>
**iso8601**: <i style="color: #267f99">Decoder&lt;Date&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/dates.js#L32-L43 'Source')

Accepts [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)-formatted strings, returns then as [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) instances.

This is very useful for working with dates in APIs: serialize them as `.toISOString()` when sending, decode them with `iso8601` when receiving.

```typescript
// 👍
iso8601.verify('2020-06-01T12:00:00Z'); // ≈ new Date('2020-06-01T12:00:00Z')

// 👎
iso8601.verify('2020-06-01');  // throws
iso8601.verify('hello');       // throws
iso8601.verify(123);           // throws
iso8601.verify(new Date());    // throws (does not accept dates)
```

---

## Constants


- [`constant()`](#constant)
- [`always()`](#always)
- [`hardcoded()`](#hardcoded) (alias of [`always()`](#always))

---

<a name="constant" href="#constant">#</a>
**constant**&lt;<i style="color: #267f99">T</i>&gt;(value: <i style="color: #267f99">T</i>): <i style="color: #267f99">Decoder&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/constants.js#L25-L31 'Source')

Accepts only the given constant value.

⚠️ **NOTE:** Flow, unlike TypeScript, will not infer constants correctly. In TypeScript, the type of `constant(42)` will correctly be inferred as `Decoder<42>`, but in Flow it will get inferred as `Decoder<number>`. To work around this, you should use this syntax in Flow: `constant((42: 42))`.

```typescript
const decoder = constant('hello');

// 👍
decoder.verify('hello') === 'hello';

// 👎
decoder.verify('this breaks');  // throws
decoder.verify(false);          // throws
decoder.verify(undefined);      // throws
```

---

<a name="always" href="#always">#</a>
**always**&lt;<i style="color: #267f99">T</i>&gt;(value: <i style="color: #267f99">T</i>): <i style="color: #267f99">Decoder&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/constants.js#L39-L41 'Source')  
<a name="hardcoded" href="#hardcoded">#</a>
**hardcoded**&lt;<i style="color: #267f99">T</i>&gt;(value: <i style="color: #267f99">T</i>): <i style="color: #267f99">Decoder&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/constants.js#L46 'Source')

Accepts anything, completely ignores it, and always returns the provided value instead.

This is useful to manually add extra fields to object decoders.

```typescript
const decoder = always(42);

// 👍
decoder.verify('hello') === 42;
decoder.verify(false) === 42;
decoder.verify(undefined) === 42;

// 👎
// This decoder will never reject an input
```

---

## Optionality


- [`null_`](#null_)
- [`undefined_`](#undefined_)
- [`optional()`](#optional)
- [`nullable()`](#nullable)
- [`maybe()`](#maybe)
- [`unknown`](#unknown)
- [`mixed`](#mixed) (alias of [`unknown`](#unknown))

---

<a name="null_" href="#null_">#</a>
**null_**: <i style="color: #267f99">Decoder&lt;null&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/constants.js#L11-L13 'Source')

Accepts and returns only the literal `null` value.

```typescript
// 👍
null_.verify(null) === null;

// 👎
null_.verify(false);         // throws
null_.verify(undefined);     // throws
null_.verify('hello world'); // throws
```

---

<a name="undefined_" href="#undefined_">#</a>
**undefined_**: <i style="color: #267f99">Decoder&lt;undefined&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/constants.js#L18-L20 'Source')

Accepts and returns only the literal `undefined` value.

```typescript
// 👍
undefined_.verify(undefined) === undefined;

// 👎
undefined_.verify(null);          // throws
undefined_.verify(false);         // throws
undefined_.verify('hello world'); // throws
```

---

<a name="optional" href="#optional">#</a>
**optional**&lt;<i style="color: #267f99">T</i>&gt;(decoder: <i style="color: #267f99">Decoder&lt;T&gt;</i>): <i style="color: #267f99">Decoder&lt;T | undefined&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/optional.js#L13-L15 'Source')

Accepts whatever the given decoder accepts, or `undefined`.

```typescript
const decoder = optional(string);

// 👍
decoder.verify('hello') === 'hello';
decoder.verify(undefined) === undefined;

// 👎
decoder.verify(null);  // throws
decoder.verify(0);     // throws
decoder.verify(42);    // throws
```

A typical case where `optional` is useful is in decoding objects with optional fields:

```typescript
object({
    id: number,
    name: string,
    address: optional(string),
});
```

Which will decode to type:

```typescript
{
  id: number;
  name: string;
  address?: string;
}
```

---

<a name="nullable" href="#nullable">#</a>
**nullable**&lt;<i style="color: #267f99">T</i>&gt;(decoder: <i style="color: #267f99">Decoder&lt;T&gt;</i>): <i style="color: #267f99">Decoder&lt;T | null&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/optional.js#L20-L22 'Source')

Accepts whatever the given decoder accepts, or `null`.

```typescript
const decoder = nullable(string);

// 👍
decoder.verify('hello') === 'hello';
decoder.verify(null) === null;

// 👎
decoder.verify(undefined);  // throws
decoder.verify(0);          // throws
decoder.verify(42);         // throws
```

---

<a name="maybe" href="#maybe">#</a>
**maybe**&lt;<i style="color: #267f99">T</i>&gt;(decoder: <i style="color: #267f99">Decoder&lt;T&gt;</i>): <i style="color: #267f99">Decoder&lt;T | null | undefined&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/optional.js#L39-L41 'Source')

Accepts whatever the given decoder accepts, or `null`, or `undefined`.

```typescript
const decoder = maybe(string);

// 👍
decoder.verify('hello') === 'hello';
decoder.verify(null) === null;
decoder.verify(undefined) === undefined;

// 👎
decoder.verify(0);   // throws
decoder.verify(42);  // throws
```

---

<a name="unknown" href="#unknown">#</a>
**unknown**: <i style="color: #267f99">Decoder&lt;unknown&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/constants.js#L55 'Source')  
<a name="mixed" href="#mixed">#</a>
**mixed**: <i style="color: #267f99">Decoder&lt;unknown&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/constants.js#L60 'Source')

Accepts anything and returns it unchanged.

Useful for situation in which you don't know or expect a specific type. Of course, the downside is that you won't know the type of the value statically and you'll have to further refine it yourself.

```typescript
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


- [`array()`](#array)
- [`nonEmptyArray()`](#nonEmptyArray)
- [`poja`](#poja)
- [`tuple()`](#tuple)
- [`set()`](#set)

---

<a name="array" href="#array">#</a>
**array**(decoder: <i style="color: #267f99">Decoder&lt;T&gt;</i>): <i style="color: #267f99">Decoder&lt;T[]&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/arrays.js#L70-L75 'Source')

Accepts arrays of whatever the given decoder accepts.

```typescript
const decoder = array(string);

// 👍
decoder.verify(['hello', 'world']) === ['hello', 'world'];
decoder.verify([]) === [];

// 👎
decoder.verify(['hello', 1.2]);  // throws
```

---

<a name="nonEmptyArray" href="#nonEmptyArray">#</a>
**nonEmptyArray**(decoder: <i style="color: #267f99">Decoder&lt;T&gt;</i>): <i style="color: #267f99">Decoder&lt;T[]&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/arrays.js#L80-L82 'Source')

Like `array()`, but will reject arrays with 0 elements.

```typescript
const decoder = nonEmptyArray(string);

// 👍
decoder.verify(['hello', 'world']) === ['hello', 'world'];

// 👎
decoder.verify(['hello', 1.2]);  // throws
decoder.verify([]);              // throws
```

---

<a name="poja" href="#poja">#</a>
**poja**: <i style="color: #267f99">Decoder&lt;unknown[]&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/arrays.js#L14-L30 'Source')

Accepts any array, but doesn't validate its items further.

"poja" means "plain old JavaScript array", a play on `pojo()`.

```typescript
// 👍
poja.verify([1, 'hi', true]) === [1, 'hi', true];
poja.verify(['hello', 'world']) === ['hello', 'world'];
poja.verify([]) === [];

// 👎
poja.verify({});    // throws
poja.verify('hi');  // throws
```

---

<a name="tuple" href="#tuple">#</a>
**tuple**&lt;<i style="color: #267f99">A</i>, <i style="color: #267f99">B</i>, <i style="color: #267f99">C</i>, <i style="color: #267f99">...</i>&gt;(<i style="color: #267f99">Decoder&lt;A&gt;</i>, <i style="color: #267f99">Decoder&lt;B&gt;</i>, <i style="color: #267f99">Decoder&lt;C&gt;</i>, <i style="color: #267f99">...</i>): <i style="color: #267f99">Decoder&lt;[A, B, C, ...]&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/arrays.js#L133 'Source')

Accepts a tuple (an array with exactly _n_ items) of values accepted by the _n_ given decoders.

```typescript
const decoder = tuple(string, number);

// 👍
decoder.verify(['hello', 1.2]) === ['hello', 1.2];

// 👎
decoder.verify([]);                  // throws, too few items
decoder.verify(['hello', 'world']);  // throws, not the right types
decoder.verify(['a', 1, 'c']);       // throws, too many items
```

---

<a name="set" href="#set">#</a>
**set**&lt;<i style="color: #267f99">T</i>&gt;(decoder: <i style="color: #267f99">Decoder&lt;T&gt;</i>): <i style="color: #267f99">Decoder&lt;Set&lt;T&gt;&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/arrays.js#L88-L90 'Source')

Similar to [`array()`](#array), but returns the result as an [ES6 Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).

```typescript
const decoder = set(string);

// 👍
decoder.verify(['abc', 'pqr'])  // ≈ new Set(['abc', 'pqr'])
decoder.verify([])              // ≈ new Set([])

// 👎
decoder.verify([1, 2]);         // throws, not the right types
```

---

## Objects


- [`object()`](#object)
- [`exact()`](#exact)
- [`inexact()`](#inexact)
- [`pojo`](#pojo)
- [`dict()`](#dict)
- [`mapping()`](#mapping)

---

<a name="object" href="#object">#</a>
**object**&lt;<i style="color: #267f99">A</i>, <i style="color: #267f99">B</i>, <i style="color: #267f99">...</i>&gt;(<i style="color: #267f99">{ field1: Decoder&lt;A&gt;, field2: Decoder&lt;B&gt;, ... }</i>): <i style="color: #267f99">Decoder&lt;{ field1: A, field2: B, ... }&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/objects.js#L76-L150 'Source')

Accepts objects with fields matching the given decoders. Extra fields that exist on the input object are ignored and will not be returned.

```typescript
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

For more information, see also [The difference between `object`, `exact`, and `inexact`](./tips#the-difference-between-object-exact-and-inexact).

---

<a name="exact" href="#exact">#</a>
**exact**&lt;<i style="color: #267f99">A</i>, <i style="color: #267f99">B</i>, <i style="color: #267f99">...</i>&gt;(<i style="color: #267f99">{ field1: Decoder&lt;A&gt;, field2: Decoder&lt;B&gt;, ... }</i>): <i style="color: #267f99">Decoder&lt;{ field1: A, field2: B, ... }&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/objects.js#L152-L173 'Source')

Like `object()`, but will reject inputs that contain extra keys that are not specified explicitly.

```typescript
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

For more information, see also [The difference between `object`, `exact`, and `inexact`](./tips#the-difference-between-object-exact-and-inexact).

---

<a name="inexact" href="#inexact">#</a>
**inexact**&lt;<i style="color: #267f99">A</i>, <i style="color: #267f99">B</i>, <i style="color: #267f99">...</i>&gt;(<i style="color: #267f99">{ field1: Decoder&lt;A&gt;, field2: Decoder&lt;B&gt;, ... }</i>): <i style="color: #267f99">Decoder&lt;{ field1: A, field2: B, ... }&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/objects.js#L175-L201 'Source')

Like `object()`, but will pass through any extra fields on the input object unvalidated that will thus be of `unknown` type statically.

```typescript
const decoder = inexact({
    x: number,
});

// 👍
decoder.verify({ x: 1, y: 2 }) === { x: 1, y: 2 };
decoder.verify({ x: 1, y: 2, z: 3 }) === { x: 1, y: 2, z: 3 };

// 👎
decoder.verify({ x: 1 });  // throws, missing field `y`
```

For more information, see also [The difference between `object`, `exact`, and `inexact`](./tips#the-difference-between-object-exact-and-inexact).

---

<a name="pojo" href="#pojo">#</a>
**pojo**: <i style="color: #267f99">Decoder&lt;{ [key: string]: unknown }&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/objects.js#L35-L55 'Source')

Accepts any "plain old JavaScript object", but doesn't validate its keys or values further.

```typescript
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

<a name="dict" href="#dict">#</a>
**dict**&lt;<i style="color: #267f99">T</i>&gt;(decoder: <i style="color: #267f99">Decoder&lt;T&gt;</i>): <i style="color: #267f99">Decoder&lt;{ [key: string]: T }&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/objects.js#L206-L233 'Source')

Accepts objects where all values match the given decoder, and returns the result as a `{ [string]: T }`.

The main difference between `object()` and `dict()` is that you'd typically use `object()` if this is a record-like object, where all field names are known and the values are heterogeneous. Whereas with `dict()` the keys are typically dynamic and the values homogeneous, like in a dictionary, a lookup table, or a cache.

```typescript
const decoder = dict(number);

// 👍
decoder.verify({ red: 1, blue: 2, green: 3 }); // ≈ { red: 1, blue: 2, green: 3 }
```

---

<a name="mapping" href="#mapping">#</a>
**mapping**&lt;<i style="color: #267f99">T</i>&gt;(decoder: <i style="color: #267f99">Decoder&lt;T&gt;</i>): <i style="color: #267f99">Decoder&lt;Map&lt;string, T&gt;&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/objects.js#L244-L253 'Source')

Similar to `dict()`, but returns the result as a `Map<string, T>` (an [ES6 Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)) instead.

```typescript
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


- [`json`](#json)
- [`jsonObject`](#jsonObject)
- [`jsonArray`](#jsonArray)

---

<a name="json" href="#json">#</a>
**json**: <i style="color: #267f99">Decoder&lt;JSONValue&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/json.js#L21-L28 'Source')

Accepts any value that's a valid JSON value.

In other words: any value returned by `JSON.parse()` should decode without failure.

- `null`
- `string`
- `number`
- `boolean`
- `{ [string]: JSONValue }`
- `JSONValue[]`

```typescript
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

<a name="jsonObject" href="#jsonObject">#</a>
**jsonObject**: <i style="color: #267f99">Decoder&lt;{ [string]: JSONValue }&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/json.js#L17 'Source')

Like `json`, but will only decode when the JSON value is an object.

```typescript
// 👍
jsonObject.verify({});                // ≈ {}
jsonObject.verify({ name: 'Amir' });  // ≈ { name: 'Amir' }

// 👎
jsonObject.verify([]);                   // throws
jsonObject.verify([{ name: 'Alice' }]);  // throws
jsonObject.verify('hello');              // throws
jsonObject.verify(null);                 // throws
```

---

<a name="jsonArray" href="#jsonArray">#</a>
**jsonArray**: <i style="color: #267f99">Decoder&lt;JSONValue[]&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/json.js#L19 'Source')

Like `json`, but will only decode when the JSON value is an array.

```typescript
// 👍
jsonArray.verify([]);                  // ≈ []
jsonArray.verify([{ name: 'Amir' }]);  // ≈ [{ name: 'Amir' }]

// 👎
jsonArray.verify({});                 // throws
jsonArray.verify({ name: 'Alice' });  // throws
jsonArray.verify('hello');            // throws
jsonArray.verify(null);               // throws
```

---

## Choice


- [`either()`](#either)
- [`taggedUnion()`](#taggedUnion)
- [`oneOf()`](#oneOf)
- [`dispatch()`](#dispatch) (alias of [`taggedUnion()`](#taggedUnion))

---

<a name="either" href="#either">#</a>
**either**&lt;<i style="color: #267f99">A</i>, <i style="color: #267f99">B</i>, <i style="color: #267f99">C</i>, <i style="color: #267f99">...</i>&gt;(<i style="color: #267f99">Decoder&lt;A&gt;</i>, <i style="color: #267f99">Decoder&lt;B&gt;</i>, <i style="color: #267f99">Decoder&lt;C&gt;</i>, <i style="color: #267f99">...</i>): <i style="color: #267f99">Decoder&lt;A | B | C | ...&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/either.js#L89 'Source')

Accepts values accepted by any of the given decoders. The decoders are tried on the input one by one, in the given order. The first one that accepts the input "wins". If all decoders reject the input, the input gets rejected.

```typescript
const decoder = either(number, string);

// 👍
decoder.verify('hello world') === 'hello world';
decoder.verify(123) === 123;

// 👎
decoder.verify(false);  // throws
```

**NOTE to Flow users:** In Flow, there is a max of 9 arguments with this construct. (This is no problem in TypeScript.) If you hit the 9 argument limit, you can work around that by stacking, e.g. do `either(<8 arguments here>, either(...))`.

---

<a name="taggedUnion" href="#taggedUnion">#</a>
**taggedUnion**&lt;<i style="color: #267f99">A</i>, <i style="color: #267f99">B</i>, <i style="color: #267f99">...</i>&gt;(field: <i style="color: #267f99">string</i>, mapping: <i style="color: #267f99">{ value1: Decoder&lt;A&gt;, value2: Decoder&lt;B&gt;, ... }</i>): <i style="color: #267f99">Decoder&lt;A | B | ...&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/dispatch.js#L46-L60 'Source')  
<a name="dispatch" href="#dispatch">#</a>
**dispatch**&lt;<i style="color: #267f99">A</i>, <i style="color: #267f99">B</i>, <i style="color: #267f99">...</i>&gt;(field: <i style="color: #267f99">string</i>, mapping: <i style="color: #267f99">{ value1: Decoder&lt;A&gt;, value2: Decoder&lt;B&gt;, ... }</i>): <i style="color: #267f99">Decoder&lt;A | B | ...&gt;</i> 

**NOTE:** In decoders@1.x, this was called `dispatch()`.

Like `either`, but optimized for building [tagged unions](https://en.wikipedia.org/wiki/Tagged_union) of object types with a common field (like a `type` field) that lets you distinguish members.

The following two decoders are effectively equivalent:

```typescript
type Rect = { __type: 'rect', x: number, y: number, width: number, height: number };
type Circle = { __type: 'circle', cx: number, cy: number, r: number };
//              ^^^^^^
//              Field that defines which decoder to pick
//                                               vvvvvv
const shape1: Decoder<Rect | Circle> = taggedUnion('__type', { rect, circle });
const shape2: Decoder<Rect | Circle> = either(rect, circle);
```

But using `taggedUnion()` will typically be more runtime-efficient than using `either()`. The reason is that `taggedUnion()` will first do minimal work to "look ahead" into the `type` field here, and based on that value, pick which decoder to invoke. Error messages will then also be tailored to the specific decoder.

The `either()` version will instead try each decoder in turn until it finds one that matches. If none of the alternatives match, it needs to report all errors, which is sometimes confusing.

---

<a name="oneOf" href="#oneOf">#</a>
**oneOf**&lt;<i style="color: #267f99">T</i>&gt;(values: <i style="color: #267f99">T[]</i>): <i style="color: #267f99">Decoder&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/either.js#L91-L106 'Source')

Accepts any value that is strictly-equal (using `===`) to one of the specified values.

```typescript
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

```typescript
oneOf(['foo', 'bar']);
```

**NOTE to Flow users:** TypeScript is capable of inferring the return type as `Decoder<'foo' | 'bar'>`, but in Flow it will (unfortunately) be `Decoder<string>`. So in Flow, be sure to explicitly annotate the type. Either by doing `oneOf([('foo': 'foo'), ('bar': 'bar')])`, or as `oneOf<'foo' | 'bar'>(['foo', 'bar'])`.

---

## Utilities


- [`prep()`](#prep)
- [`never`](#never)
- [`instanceOf()`](#instanceOf)
- [`lazy()`](#lazy)
- [`fail`](#fail) (alias of [`never`](#never))

---

<a name="prep" href="#prep">#</a>
**prep**&lt;<i style="color: #267f99">T</i>&gt;(mapperFn: <i style="color: #267f99">(raw: mixed) =&gt; mixed</i>, decoder: <i style="color: #267f99">Decoder&lt;T&gt;</i>): <i style="color: #267f99">Decoder&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/composition.js#L14-L29 'Source')

Pre-process the raw data input before passing it into the decoder. This gives you the ability to arbitrarily customize the input on the fly before passing it to the decoder. Of course, the input value at that point is still of `unknown` type, so you will have to deal with that accordingly.

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

---

<a name="never" href="#never">#</a>
**never**: <i style="color: #267f99">Decoder&lt;never&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/never.js#L11-L13 'Source')  
<a name="fail" href="#fail">#</a>
**fail**: <i style="color: #267f99">Decoder&lt;never&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/never.js#L18 'Source')

Rejects all inputs, and always fails with the given error message. May be useful for explicitly disallowing keys, or for testing purposes.

```typescript
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

---

<a name="instanceOf" href="#instanceOf">#</a>
**instanceOf**&lt;<i style="color: #267f99">T</i>&gt;(klass: <i style="color: #267f99">Class&lt;T&gt;</i>): <i style="color: #267f99">Decoder&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/instanceOf.js#L8-L22 'Source')

Accepts any value that is an `instanceof` the given class.

```typescript
const decoder = instanceOf(Error);

// 👍
const value = new Error('foo');
decoder.verify(value) === value;

// 👎
decoder.verify('foo');  // throws
decoder.verify(3);      // throws
```

---

<a name="lazy" href="#lazy">#</a>
**lazy**&lt;<i style="color: #267f99">T</i>&gt;(decoderFn: <i style="color: #267f99">() =&gt; Decoder&lt;T&gt;</i>): <i style="color: #267f99">Decoder&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/lazy.js#L11-L13 'Source')

Lazily evaluate the given decoder. This is useful to build self-referential types for recursive data structures. Example:

```typescript
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

<!--[[[end]]] (checksum: cb3a04fa29716e0f9d93d756914579d9) -->
<!-- prettier-ignore-end -->
