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
- [`.and()`](/Decoder.html#and)
- [`.chain()`](/Decoder.html#chain)
- [`.transform()`](/Decoder.html#transform)
- [`.describe()`](/Decoder.html#describe)
<!--[[[end]]] (checksum: 78f857106ed6ae1b5e2b7702c323291e) -->

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
**.verify**(blob: <i style="color: #267f99">mixed</i>): <i style="color: #267f99">T</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/Decoder.js#L64-L73 'Source')<br />

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
**.decode**(blob: <i style="color: #267f99">mixed</i>): <i style="color: #267f99">DecodeResult&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/Decoder.js#L56-L59 'Source')<br />

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

<a name="and" href="#and">#</a>
**.and**(predicate: <i style="color: #267f99">T =&gt; boolean</i>, message: <i style="color: #267f99">string</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/Decoder.js#L75-L81 'Source')<br />

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
**.chain**&lt;<i style="color: #267f99">V</i>&gt;(nextDecodeFn: <i style="color: #267f99">T =&gt; DecodeFn&lt;V, T&gt;</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;V&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/Decoder.js#L127-L131 'Source')<br />

Chain together the current decoder with the given decode function. The given function will only get called after the current decoder accepts an input.

The given "next" decoding function will thus be able to make more assumptions about its input value, i.e. it can know what type the input value is (`T` instead of ``unknown``).

This is an advanced decoder, typically only useful for authors of decoders. It's not recommended to rely on this decoder directly for normal usage.  In most cases, [`.transform()`](/Decoder.html#transform) is what you'll want instead.

---

<a name="transform" href="#transform">#</a>
**.transform**&lt;<i style="color: #267f99">V</i>&gt;(transformFn: <i style="color: #267f99">(T) =&gt; V</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;V&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/Decoder.js#L89-L101 'Source')<br />

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
**.describe**(message: <i style="color: #267f99">string</i>): <i style="color: #267f99"><a href="/Decoder.html" style="color: inherit">Decoder</a>&lt;T&gt;</i> [<small>(source)</small>](https://github.com/nvie/decoders/tree/main/src/Decoder.js#L103-L115 'Source')<br />

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

<!--[[[end]]] (checksum: 298a20db2af5afd625e1b155664ec5d8)-->
<!-- prettier-ignore-end -->
