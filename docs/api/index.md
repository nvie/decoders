---
title: API Reference
nav_order: 10
has_children: true
---

# API Reference

The decoders package consists of a few building blocks:

-   [Guards](#guards)
-   [Building custom decoders](#building-custom-decoders)

### Guards

<a name="guard" href="#guard">#</a> <b>guard</b>(decoder: <i>Decoder&lt;T&gt;</i>,
formatter?: <i>Annotation => string</i>): <i>Guard&lt;T&gt;</i>
[&lt;&gt;](https://github.com/nvie/decoders/blob/main/src/_guard.js 'Source')

Turns any given `Decoder<T>` into a `Guard<T>`.

A guard works like a decoder, but will either:

-   Return the decoded value (aka the happy path)
-   Or throw an exception

So a Guard bypasses the intermediate "Result" type that decoders output. An "ok" result
will get returned, an "err" result will be formatted into an error message and thrown.

The typical usage is that you keep composing decoders until you have one decoder for your
entire input object, and then use a guard to wrap that outer decoder. Decoders can be
composed to build larger decoders. Guards cannot be composed.

#### Formatting error messsages

By default, `guard()` will use the `formatInline` error formatter. You can pass another
built-in formatter as the second argument, or provide your own. (This will require
understanding the internal `Annotation` datastructure that decoders uses for error
reporting.)

Built-in formatters are:

-   `formatInline` (default) — will echo back the input object and inline error messages
    smartly. Example:

    ```typescript
    import { array, guard, object, string } from 'decoders';
    import { formatInline } from 'decoders/format';

    const mydecoder = array(object({ name: string, age: number }));

    const defaultGuard = guard(mydecoder, formatInline);
    defaultGuard([{ name: 'Alice', age: '33' }]);
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
    const customGuard = guard(mydecoder, formatShort);
    ```

    Will throw the following error message:

    ```text
    Decoding error: Value at keypath 0.age: Must be number
    ```
