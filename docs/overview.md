---
title: Overview
nav_order: 1
---

### Building custom decoders

There are two main building blocks for defining your own custom decoders: `map()` and
`compose()`.

There are roughly 3 use cases that you will want to use:

1. **[Transformation](#transformation)** (i.e. read one type, but return another, or read
   a type but change its value before returning)
1. **[Adding extra value requirements](#adding-predicates)** (i.e. decode using an
   existing decoder, but require an extra value check)
1. **Chaining** multiple decoders (less common, more advanced)

#### Transformation

To read one type from the input, but return another, use:

```js
const numericString: Decoder<number> = map(
    // At runtime, expect to read a string...
    string,
    // ...but return it as a number
    (s) => Number(s),
);
```

To read one type, but change its value before returning:

```js
const upperCase: Decoder<string> = map(string, (s) => s.toUpperCase());
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
