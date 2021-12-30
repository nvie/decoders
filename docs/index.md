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

<img alt="The concept of a decoder explained schematically" src="./assets/schematic-decoders.png" style="max-width: min(413px, 100%)" />

A decoder can either _accept_ or _reject_ the given untrusted input. Whether it accepts or
rejects depends on the decoder's implementation. Every decoder has a type, for example
when you see a decoder of type `Decoder<string>` it means it will always return a string
_if_ it accepts the input. It does not mean it will only _accept_ strings. You can
implement a decoder that will only _accept_ numbers, but return strings. What values are
accepted by a decoder depends on its implementation. See its documentation to learn what
it accepts.
