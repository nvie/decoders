---
title: Decoder API
nav_order: 10
---

<!--[[[cog
import cog
import html
import re
import textwrap
from _data import DECODERS, DECODERS_BY_SECTION, DECODER_METHODS
from _lib import (
  format_type,
  linkify,
  methodref,
  ref,
  reindent,
  safe,
  source_link,
)
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
- [`.decode()`](/Decoder.html#decode)
- [`.transform()`](/Decoder.html#transform)
- [`.refine()`](/Decoder.html#refine)
- [`.reject()`](/Decoder.html#reject)
- [`.describe()`](/Decoder.html#describe)
- [`.then()`](/Decoder.html#then)
<!--[[[end]]] (checksum: 65516e5ec3782afbbbe223d7162844f4) -->

<!--[[[cog
for (name, info) in DECODER_METHODS.items():
  name = safe(name)
  params = '' if not info['params'] else '(' + ', '.join([f'{safe(pname)}: {format_type(ptype)}' for (pname, ptype) in info['params']]) + ')'
  type_params = '' if not info.get('type_params') else safe('<') + ', '.join([format_type(ptype) for ptype in info['type_params']]) + safe('>')
  return_type = format_type(info['return_type'])
  markdown = linkify(reindent(info['markdown'], prefix='    '))
  cog.outl(f"""
    ---

    <a name="{name}" href="#{name}">#</a>
    **.{name}**{type_params}{params}: {return_type} {source_link(name)}<br />

    {markdown}
  """, dedent=True, trimblanklines=True)
]]]-->
---

<a name="verify" href="#verify">#</a>
**.verify**(blob: <i style="color: #267f99">mixed</i>): <i style="color: #267f99">T</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/Decoder.js#L99-L108 'Source')<br />

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
**.decode**(blob: <i style="color: #267f99">mixed</i>): <i style="color: #267f99">DecodeResult&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/Decoder.js#L79-L82 'Source')<br />

Validates the raw/untrusted/unknown input and either accepts or rejects it.

Contrasted with [`.verify()`](/Decoder.html#verify), calls to [`.decode()`](/Decoder.html#decode) will never fail and instead return a result type.

For example, take this simple “number” decoder. When given an number value, it will return an ok: true result. Otherwise, it will return an ok: false result with the original input value annotated.

```typescript
// 👍
number.decode(3);     // { ok: true, value: 3 };

// 👎
number.decode('hi');  // { ok: false, error: { type: 'scalar', value: 'hi', text: 'Must be number' } }
```

---

<a name="transform" href="#transform">#</a>
**.transform**&lt;<i style="color: #267f99">V</i>&gt;(transformFn: <i style="color: #267f99">(T) =&gt; V</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;V&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/Decoder.js#L128-L130 'Source')<br />

Accepts any value the given decoder accepts, and on success, will call the given function **on the decoded result**. If the transformation function throws an error, the whole decoder will fail using the error message as the failure reason.

```typescript
const upper = string.transform((s) => s.toUpperCase());

// 👍
upper.verify('foo') === 'FOO'

// 👎
upper.verify(4);  // throws
```

---

<a name="refine" href="#refine">#</a>
**.refine**(predicate: <i style="color: #267f99">T =&gt; boolean</i>, message: <i style="color: #267f99">string</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/Decoder.js#L110-L118 'Source')<br />

Adds an extra predicate to a decoder. The new decoder is like the original decoder, but only accepts values that also meet the predicate.

```typescript
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

<a name="reject" href="#reject">#</a>
**.reject**(rejectFn: <i style="color: #267f99">T =&gt; string | null</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/Decoder.js#L87-L94 'Source')<br />

Adds an extra predicate to a decoder. The new decoder is like the original decoder, but only accepts values that aren't rejected by the given function.

The given function can return `null` to accept the decoded value, or return a specific error message to reject.

Unlike [`.refine()`](/Decoder.html#refine), you can use this function to return a dynamic error message.

```typescript
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

<a name="describe" href="#describe">#</a>
**.describe**(message: <i style="color: #267f99">string</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/Decoder.js#L132-L144 'Source')<br />

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

---

<a name="then" href="#then">#</a>
**.then**&lt;<i style="color: #267f99">V</i>&gt;(next: <i style="color: #267f99">DecodeFn&lt;V, T&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;V&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/Decoder.js#L84-L85 'Source')<br />

Chain together the current decoder with another.

First, the current decoder must accept the input. If so, it will pass the successfully decoded result to the given ``next`` function to further decide whether or not the value should get accepted or rejected.

The argument to [`.then()`](/Decoder.html#then) is a decoding function, just like one you would pass to [`define()`](/api.html#define). The key difference with [`define()`](/api.html#define) is that [`define()`](/api.html#define) must always assume an ``unknown`` input, whereas with a [`.then()`](/Decoder.html#then) call the provided ``next`` function will receive a ``T`` as its input. This will allow the function to make a stronger assumption about its input.

If it helps, you can think of `define(nextFn)` as equivalent to `unknown.then(nextFn)`.

This is an advanced, low-level, decoder. It's not recommended to reach for this low-level construct when implementing custom decoders. Most cases can be covered by [`.transform()`](/Decoder.html#transform) or [`.refine()`](/Decoder.html#refine).

<!--[[[end]]] (checksum: a27a0ad99d16ec9ee4afae465708b15d)-->
<!-- prettier-ignore-end -->
