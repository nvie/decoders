---
title: Decoder class
parent: API Reference
nav_order: 10
---

<!--[[[cog
import cog
import html
import re
import textwrap
from _data import DECODER_METHODS
from _lib import get_markdown, get_signature_html, methodref
]]]-->
<!--[[[end]]] (checksum: d41d8cd98f00b204e9800998ecf8427e) -->

# `Decoder<T>` methods

All decoders have the following methods.

<!-- prettier-ignore-start -->
<!--[[[cog
for name in DECODER_METHODS:
  cog.outl(f'- {methodref(name)}')
]]]-->
- [`.verify()`](/Decoder.html#verify)
- [`.value()`](/Decoder.html#value)
- [`.decode()`](/Decoder.html#decode)
- [`.transform()`](/Decoder.html#transform)
- [`.refine()`](/Decoder.html#refine)
- [`.reject()`](/Decoder.html#reject)
- [`.describe()`](/Decoder.html#describe)
- [`.then()`](/Decoder.html#then)
- [`.pipe()`](/Decoder.html#pipe)
<!--[[[end]]] (checksum: 076ce6c004cb18a363b0b57b48ecaa60) -->

<!--[[[cog
for name in DECODER_METHODS:
  cog.outl('---')
  cog.outl()
  cog.outl(get_signature_html(name))
  cog.outl()
  cog.outl(get_markdown(name))
  cog.outl()
]]]-->
---

<a href="#verify">#</a> **.verify**(blob: <i style="color: #267f99">mixed</i>): <i style="color: #267f99">T</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/Decoder.ts#L182-L194 'Source')
{: #verify .signature}

Verifies the untrusted/unknown input and either accepts or rejects it.
When accepted, returns a value of type `T`. Otherwise fail with
a runtime error.

<img alt="The .verify() method explained" src="./assets/schematic-verify.png" style="max-width: min(592px, 100%)" />

For example, take this simple number decoder.

```ts
// 👍
number.verify(123);     // 123
number.verify(3.1415);  // 3.1415

// 👎
number.verify('hello'); // throws
// Decoding error:
// "hello"
// ^^^^^^^ Must be number
```

---

<a href="#value">#</a> **.value**(blob: <i style="color: #267f99">mixed</i>): <i style="color: #267f99">T | undefined</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/Decoder.ts#L196-L206 'Source')
{: #value .signature}

Verifies the untrusted/unknown input and either accepts or rejects it.
When accepted, returns the decoded `T` value directly. Otherwise returns
`undefined`.

Use this when you're not interested in programmatically handling the
error message.

<img alt="The .value() method explained" src="./assets/schematic-value.png" style="max-width: min(592px, 100%)" />

```ts
// 👍
number.value(3);     // 3
string.value('hi');  // 'hi'

// 👎
number.value('hi');  // undefined
string.value(42);    // undefined
```

> _**NOTE:** When you use this on [`optional()`](/api.html#optional) decoders, you cannot distinguish a rejected value from an accepted ``undefined`` input value._

---

<a href="#decode">#</a> **.decode**(blob: <i style="color: #267f99">mixed</i>): <i style="color: #267f99">DecodeResult&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/Decoder.ts#L166-L180 'Source')
{: #decode .signature}

Verifies the untrusted/unknown input and either accepts or rejects it.

Contrasted with [`.verify()`](/Decoder.html#verify), calls to [`.decode()`](/Decoder.html#decode) will never fail and
instead return a result type.

<img alt="The .decode() method explained" src="./assets/schematic-decode.png" style="max-width: min(592px, 100%)" />

For example, take this simple "number" decoder. When given an number value, it will return an ok: true result. Otherwise, it will return an ok: false result with the original input value annotated.

```ts
// 👍
number.decode(3);     // { ok: true, value: 3 };

// 👎
number.decode('hi');  // { ok: false, error: { type: 'scalar', value: 'hi', text: 'Must be number' } }
```

---

<a href="#transform">#</a> **.transform**&lt;<i style="color: #267f99">V</i>&gt;(transformFn: <i style="color: #267f99">(T) =&gt; V</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;V&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/Decoder.ts#L208-L216 'Source')
{: #transform .signature}

Accepts any value the given decoder accepts, and on success, will call
the given function **on the decoded result**. If the transformation
function throws an error, the whole decoder will fail using the error
message as the failure reason.

```ts
const upper = string.transform((s) => s.toUpperCase());

// 👍
upper.verify('foo') === 'FOO'

// 👎
upper.verify(4);  // throws
```

---

<a href="#refine">#</a> **.refine**(predicate: <i style="color: #267f99">T =&gt; boolean</i>, message: <i style="color: #267f99">string</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/Decoder.ts#L218-L231 'Source')
{: #refine .signature}

Adds an extra predicate to a decoder. The new decoder is like the
original decoder, but only accepts values that also meet the
predicate.

```ts
const odd = number.refine(
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

<a href="#reject">#</a> **.reject**(rejectFn: <i style="color: #267f99">T =&gt; string | null</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/Decoder.ts#L275-L293 'Source')
{: #reject .signature}

Adds an extra predicate to a decoder. The new decoder is like the
original decoder, but only accepts values that aren't rejected by the
given function.

The given function can return `null` to accept the decoded value, or
return a specific error message to reject.

Unlike [`.refine()`](/Decoder.html#refine), you can use this function to return a dynamic error
message.

```ts
const decoder = pojo
  .reject(
    obj => {
      const badKeys = Object.keys(obj).filter(key => key.startsWith('_'));
      return badKeys.length > 0
        ? `Disallowed keys: ${badKeys.join(', ')}`
        : null;
    }
  );

// 👍
decoder.verify({ id: 123, name: 'Vincent' }) === { id: 123, name: 'Vincent' };

// 👎
decoder.verify({ id: 123, _name: 'Vincent'  })   // throws: "Disallowed keys: _name"
```

---

<a href="#describe">#</a> **.describe**(message: <i style="color: #267f99">string</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/Decoder.ts#L295-L312 'Source')
{: #describe .signature}

Uses the given decoder, but will use an alternative error message in case it rejects. This can be used to simplify or shorten otherwise long or low-level/technical errors.

```ts
const vowel = oneOf(['a', 'e', 'i', 'o', 'u'])
  .describe('Must be vowel');
```

---

<a href="#then">#</a> **.then**&lt;<i style="color: #267f99">V</i>&gt;(next: <i style="color: #267f99">(blob: T, ok, err) =&gt; DecodeResult&lt;V&gt; | <a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;V&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;V&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/Decoder.ts#L233-L251 'Source')
{: #then .signature}

<a href="#then">#</a> **.then**&lt;<i style="color: #267f99">V</i>&gt;(next: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;V&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;V&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/Decoder.ts#L233-L251 'Source')
{: #then .signature}

Send the output of the current decoder into another decoder or acceptance
function. The given acceptance function will receive the output of the
current decoder as its input.

> _**NOTE:** This is an advanced, low-level, API. It's not recommended
> to reach for this construct unless there is no other way. Most cases can
> be covered more elegantly by [`.transform()`](/Decoder.html#transform), [`.refine()`](/Decoder.html#refine), or [`.pipe()`](/Decoder.html#pipe)
> instead._

---

<a href="#pipe">#</a> **.pipe**&lt;<i style="color: #267f99">V</i>&gt;(next: <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;V&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;V&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/Decoder.ts#L253-L273 'Source')
{: #pipe .signature}

<a href="#pipe">#</a> **.pipe**&lt;<i style="color: #267f99">V</i>&gt;(next: <i style="color: #267f99">(blob: T) =&gt; <a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;V&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;V&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/core/Decoder.ts#L253-L273 'Source')
{: #pipe .signature}

```tsx
const decoder =
  string
    .transform((s) => s.split(',').map(Number))
    .pipe(array(positiveInteger));

// 👍
decoder.verify('7') === [7];
decoder.verify('1,2,3') === [1, 2, 3];

// 👎
decoder.verify('1,-3')  // -3 is not positive
decoder.verify('🚀');   // not a number
decoder.verify('3.14'); // not a whole number
decoder.verify(123);    // not a string
decoder.verify(true);   // not a string
decoder.verify(null);   // not a string
```

#### Dynamic decoder selection with ``.pipe()``

With [`.pipe()`](/Decoder.html#pipe) you can also dynamically select another decoder, based on dynamic runtime value.

```tsx
string
  .transform((s) => s.split(',').map(Number))
  .pipe((tup) =>
    tup.length === 2
      ? point2d
      : tup.length === 3
        ? point3d
        : never('Invalid coordinate'),
  );
```

<!--[[[end]]] (checksum: 93e338e2d09c83b89197e3f11696c7e8) -->
<!-- prettier-ignore-end -->
