---
title: Overview
nav_order: 0
---

<!-- prettier-ignore-start -->
# Validate untrusted inputs
{: .fs-8 .fw-400 }
<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->
Decoders is an elegant and battle-tested validation library for type-safe input data for
[TypeScript](https://www.typescriptlang.org/) and [Flow](https://flow.org/).
{: .fs-6 .fw-300 }
<!-- prettier-ignore-end -->

[Get started now](#getting-started){: .btn .btn-primary .fs-6 .mb-4 .mb-md-0 .mr-4 .px-5
.py-3 } [API Reference](https://nvie.com/decoders/api){: .btn .fs-6 .mb-4 .mb-md-0 .px-5
.py-3 }

## Getting started

Just install the package and you're ready to go.

    $ npm install decoders

## Motivation

Data entering your application from the outside world should not be trusted without
validation and often is of the `any` type, effectively disabling your type checker around
input values. It's an industry good practice to validate your expectations right at your
program's boundaries. This has two benefits: (1) your inputs are getting validated, and
(2) you can now statically know for sure the shape of the incoming data. **Decoders help
solve both of these problems at once.**

## The core idea

The central concept of this library is the Decoder. A `Decoder<T>` is a validation
function that, when called on an untrusted input, will either return an "ok" result with
the decoded value of type `T` as its payload, or an "error" result.

This way, you can be sure that all untrusted runtime data is always in the shape you
expect, and that static types can correctly be inferred for dynamic input data.

<img alt="The concept of a Decoder explained schematically" src="./assets/schematic-decoders.png" style="max-width: min(600px, 100%)" />

A decoder can either _accept_ or _reject_ the given untrusted input. Whether it accepts or
rejects depends on the decoder's implementation. The return value always is either an "ok"
or an "error" result (aka a `DecodeResult<T>`)—it will never throw an exception at
runtime. That's what Guards do.

The second important concept is a Guard. It's a convenience wrapper around an existing
(large) decoder. A `Guard<T>` is like the Decoder that it wraps, but does not return those
intermediate "result" objects that Decoders do.

<img alt="The concept of a Guard explained schematically" src="./assets/schematic-guards.png" style="max-width: min(600px, 100%)" />

When called on an untrusted input, it will either directly return the decoded value, or
throw an error. This allows you to not have to deal with the intermediate "ok" and "err"
results returned by the Decoder.

## Understanding the "type" of a Decoder

Every decoder has a type, for example when you see a decoder of type `Decoder<string>` it
means that _if_ it accepts the runtime input, it will always return a `string`.

It does **not** mean it will only accept string inputs! Take the `truthy` decoder as an
example. That one will accept _any_ input value, but return a `boolean`. What values will
get accepted by a decoder depends on its implementation. The decoder's documentation will
tell you what inputs it accepts.

## Composing decoders

You can build larger decoders from smaller decoders. For example, here you can see how
four decoders are combined to build a fourth, larger decoder:

<!-- prettier-ignore-start -->
```typescript
import { array, number, object, positiveInteger, string } from 'decoders';

   object({
     id: positiveInteger,
//       ^^^^^^^^^^^^^^^   Decoder<number>                    (1)
     name: string,
//         ^^^^^^          Decoder<string>                    (2)
     items: array(number),
//                ^^^^^^   Decoder<number>                    (3)
//          ^^^^^^^^^^^^^  Decoder<number[]>                  (4)
   })
// ^^ Decoder<{ id: number, name: string; items: number[] }>  (5)
```
<!-- prettier-ignore-end -->

<!--

## Example

Suppose, for example, you have a webhook endpoint that will receive user payloads:

```json
import { array, iso8601, number, object, optional, string } from 'decoders';

// External data, for example JSON.parse()'ed from a request payload
const externalData = {
    id: 123,
    name: 'Alison Roberts',
    createdAt: '1994-01-11T12:26:37.024Z',
    tags: ['foo', 'bar', 'qux'],
};

const userDecoder = object({
    id: number,
    name: string,
    createdAt: optional(iso8601),
    friends: array(string),
});

// NOTE: TypeScript will automatically infer this type for the `user` variable
// interface User {
//     id: number;
//     name: string;
//     createdAt?: Date;
//     friends: string[];
// }

const user = userDecoder.verify(externalData);
```
-->

## Formatting error messsages

By default, `.verify()` will use the `formatInline` error formatter. You can pass another
built-in formatter as the second argument, or provide your own. (This will require
understanding the internal `Annotation` datastructure that decoders uses for error
reporting.)

Built-in formatters are:

-   `formatInline` (default) — will echo back the input object and inline error messages
    smartly. Example:

    ```typescript
    import { array, object, string } from 'decoders';
    import { formatInline } from 'decoders/format';

    const mydecoder = array(object({ name: string, age: number }));

    const externalData = [{ name: 'Alice', age: '33' }];
    const defaultGuard = mydecoder.verify(externalData, formatInline);
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
    mydecoder.verify(externalData, formatShort);
    ```

    Will throw the following error message:

    ```text
    Decoding error: Value at keypath 0.age: Must be number
    ```
