---
title: Home
nav_order: 0
---

# Validate your untrusted inputs

<!-- prettier-ignore-start -->
Decoders is an elegant and battle-tested validation library for type-safe input data for
TypeScript and Flow.
{: .fs-6 .fw-300 }
<!-- prettier-ignore-end -->

[Get started now](#getting-started){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 }
[View it on GitHub](https://github.com/nvie/decoders){: .btn .fs-5 .mb-4 .mb-md-0 }

## Getting started

Just install the package and you're ready to go.

    $ npm install decoders

## The core idea

The central concept of this library is the Decoder. A `Decoder<T>` is a validation
function that, when called on an untrusted input, will either return an "ok" result with
the decoded value of type `T` as its payload, or an "error" result, with the original
input object annotated.

<img alt="The concept of a Decoder explained schematically" src="./assets/schematic-decoders.png" style="max-width: min(416px, 100%)" />

A decoder can either _accept_ or _reject_ the given untrusted input. Whether it accepts or
rejects depends on the decoder's implementation. Every decoder has a type, for example
when you see a decoder of type `Decoder<string>` it means it will always return a string
_if_ it accepts the runtime input. It does not mean it will only _accept_ string inputs.
(You can, for example, still implement a decoder that will only _accept_ numbers, but
_return_ strings.) What values will get accepted by a decoder depends on its
implementation. The decoder's documentation will tell you what inputs it accepts.

A decoder will never throw when called on an untrusted input. Instead, it will always
return the "ok" or "error" result intermediate object.

The second important concept is a Guard. A `Guard<T>` is like the decoder that it wraps:

<img alt="The concept of a Guard explained schematically" src="./assets/schematic-guards.png" style="max-width: min(355px, 100%)" />

When called on an untrusted input, it will either directly return the "ok" value, or throw
an error. This allows you to not have to deal with the intermediate "ok" and "err" results
returned by the Decoder.

## Motivation

<!-- TODO -->

TODO: At the boundary of your apps, you cannot trust the input data.

<!-- TODO -->

TODO: Using a decoder will both verify the data is in the shape you expect at runtime, and
at the same time, you get the benefit of type inference in your statically type-checked
app.
