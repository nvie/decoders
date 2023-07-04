---
title: Building your own
parent: Guides
nav_order: 10
---

# Building your own custom decoders

When defining new decoders, it's important to understand the difference between what
values it **accepts** vs which values it **returns**. In many cases these are the same.
This can make it confusing to notice there even is a difference. For example, the
[`string`](/api.html#string) decoder _accepts_ strings, and also _returns_ (those same)
strings.

This isn't always automatically the case, though. Some random examples:

| This decoder...                | ...accepts | ...but returns | ...so its type is  |
| :----------------------------- | :--------- | :------------- | :----------------- |
| [`string`](/api.html#string)   | strings    | strings        | `Decoder<string>`  |
| [`email`](/api.html#email)     | strings    | strings        | `Decoder<string>`  |
| [`number`](/api.html#number)   | numbers    | numbers        | `Decoder<number>`  |
| [`integer`](/api.html#integer) | numbers    | numbers        | `Decoder<number>`  |
| [`iso8601`](/api.html#iso8601) | strings    | Date instances | `Decoder<Date>`    |
| [`url`](/api.html#url)         | strings    | URL instances  | `Decoder<URL>`     |
| [`truthy`](/api.html#truthy)   | anything!  | booleans       | `Decoder<boolean>` |

From the type definition, you can always tell what the decoder will _return_. You cannot
tell from the type what input values it will _accept_. You'll need to read the
documentation or look at the implementation to know which values are going to get accepted
or rejected.

## Defining a new decoder

The easiest way to define a new decoder, is to define it in terms of an existing one that
already accepts (at least) all of the values you want your new decoder to accept, and then
narrow it down.

The **tl;dr** is:

-   Start from an existing decoder that already accepts (at least) all inputs that you
    want to be accepting
-   Optionally, narrow down what will get **accepted** by adding extra criteria with
    [`.refine()`](/Decoder.html#refine)
-   Optionally, to change what your custom decoder **returns**, use
    [`.transform()`](/Decoder.html#transform)

Now, let's build a few custom decoders to illustrate the above.

## Example 1: a "max length" string

To build a decoder _accepting_ strings up until a maximum number of characters, we can
start from the base `string` decoder. After all, we're only interested in accepting string
values.

What we want to do is putting an extra acceptance predicate on these string inputs. We use
[`.refine()`](/Decoder.html#refine) for that.

<!-- prettier-ignore-start -->
```typescript
const maxLength = string.refine(
    (s) => s.length <= 20,
    'Too long. Must be at most 20 characters',
);
```
<!-- prettier-ignore-end -->

We can generalize this by making this a function:

<!-- prettier-ignore-start -->
```typescript
function maxLength(size: number): Decoder<string> {
  return string.refine(
    (s) => s.length <= size,
    `Too long. Must be at most ${size} characters`,
  );
}

const max20 = maxLength(20);
const max50 = maxLength(50);
...
```
<!-- prettier-ignore-end -->

Notice how this decoder works when you pass it arbitrary inputs:

<!-- prettier-ignore-start -->
```typescript
const max20 = maxLength(20);

// 👍
max20.verify('hi');  // 'hi'

// 👎
max20.verify('Lorem ipsum dolor sit amet.');  // throws "Too long. Must be at most 20 characters"
max20.verify(123);  // throws "Must be string"
```
<!-- prettier-ignore-end -->

Note that you get the rejection of numbers and other non-string inputs for free if you
build your decoder this way. The `"Must be string"` guarantee and error message is
provided by the base [`string`](/api.html#string) decoder.

## Example 2: a truncating "max length" string

The example above will _reject_ strings that are too long. Suppose you don't want to
_reject_ those strings, but instead just chop them off at the given max length. In that
case, you want to not change what values it _accepts_, but what values it _returns_. You
do that by adding a [`.transform()`](/Decoder.html#transform) function:

```typescript
function truncated(size: number): Decoder<string> {
    return string.transform((s) => s.substring(0, size));
}

const str20 = truncated(20);

// 👍
str20.verify('hi'); // 'hi'
str20.verify('Lorem ipsum dolor sit amet.'); // 'Lorem ipsum dolor si'

// 👎
str20.verify(123); // throws "Must be string"
```

Compared to example 1, you can see how the "lorem ipsum" string now gets accepted (but
returned in truncated form).

## Example 3: Accepting Wordle words

Suppose you want to build your own [Wordle](https://www.powerlanguage.co.uk/wordle/)
clone, because that's what the world needs. At the boundary of your program, you'll want
to enforce that these are 5-letter worlds with only alphabetical letters.

We want to build this as a decoder that:

-   _Accepts_ strings containing exactly 5 alphabetical characters
-   _Return_ those in uppercased form (even when not inputted as such)

To define the acceptance criteria, we'll use a [`regex()`](/api.html#regex) decoder. This
will enforce that only alphabetical chars are used, and that there are exactly 5 of them
(it's important that the regex pattern is anchored using `^` and `$` for that). Also,
we'll accept case-insensitive input with the `i` flag.

Then, we'll transform any accepted words to uppercase automatically.

```typescript
const wordle = regex(/^[a-z]{5}$/i, 'Must be 5-letter word').transform((s) =>
    s.toUpperCase(),
);

// 👍
wordle.verify('Sweet'); // 'SWEET'
wordle.verify('space'); // 'SPACE'

// 👎
wordle.verify('Hey!!'); // throws "Must be 5-letter word"
wordle.verify('hi'); // throws "Must be 5-letter word"
wordle.verify(123); // throws "Must be string"
```

## Example 4: Making a transformation reusable

The wordle example above will uppercase the output before returning it. Suppose that you
want to use that on other string decoders as well. Do you all just stick `.transform()`
after those?

You can define this as a higher-order decoder which works for _any_ string decoder (aka
`Decoder<string>`). Simply define this as a function if you want to make writing these
easier:

```typescript
function uppercase(decoder: Decoder<string>): Decoder<string> {
    return decoder.transform((s) => s.toUpperCase());
}
```

<!-- prettier-ignore-start -->
```typescript
import { email, regex, string } from 'decoders';

// These now all magically work
uppercase(string);
uppercase(regex(/^\w+$/, 'Must be single word'));
uppercase(email);

// Using this on non-string decoders makes no sense though
uppercase(number);        // TypeError
uppercase(array(number)); // TypeError
```
<!-- prettier-ignore-end -->

This may make your object definitions super readable:

```typescript
const tag = regex(/^\w+$/, 'Must be single word');

const thing = object({
    email: uppercase(email),
    labels: array(uppercase(tag)),
});

thing.verify({ email: 'user@example.org', labels: ['easy'] });
// => { email: 'USER@EXAMPLE.ORG', labels: ['EASY'] })
```

## Example 5: Sanitizing messy inputs

While I would not recommend going overboard with this, you can perform light parsing to
clean up messy inputs. For example, if you have to handle messy data from an incoming
webhook that you have no control over, you can use a decoder at the boundary to not only
validate those inputs, but also to tidy things up in the same pass.

For example, suppose you have an incoming webhook that looks like this:

```json
{
    "events": [
        { "id": 1, "created_at": "2022-02-01T08:12:29Z", "labels": "urgent, delayed" },
        { "id": 2, "created_at": null, "labels": "" },
        { "id": 3, "labels": null }
    ]
}
```

Suppose we want to to clean up some data on the way in:

1. We store all `id`s as strings internally, so we'll want to transform those numeric IDs
2. The `created_at` field (an ISO8601-formatted string) is sometimes `null` and sometimes
   missing completely. When it's missing, we'll want to treat it as if it was `null`
3. The `labels` argument represents a list of tags we'll want to treat as structural data,
   so we'll want to convert these values to an array of strings

### Handling the `id` field

We'll want to look at the `id` field as containing an "ID" data type, not a number. We can
define an `id` decoder for this:

```typescript
const id: Decoder<string> = either(
    string,
    positiveInteger.transform((n) => String(n)),
);
```

This decoder will play nicely if ever this vendor will switch to `id` strings in the
future.

### Handling the `created_at` field

We'll want to look at the `created_at` field as a `Date | null` value. So let's use the
following decoder:

```typescript
maybe(iso8601, null);
```

Wait, why not use `nullable(iso8601)` here?! The reason is the third event in the example.
Because the field can legally be missing, we'll have to explicitly accept both `undefined`
and `null` inputs. That's what the [`maybe()`](/api.html#maybe) decoder does! Its second
argument is a convenience default value that nullish values will get normalized to.

### Handling the `labels` field

We'll want to look at the `labels` field as an array of strings, but we're given a string.
(A potentially `null` or empty string, even.)

We can build a comma-separated helper decoder like so:

```typescript
const commaSeparated = string.transform((s) => s.split(',').filter(Boolean));
```

### Putting it all together

Using the helper decoders defined above, we can put it all together this way:

```typescript
const eventsDecoder = object({
    events: array(
        object({
            id,
            created_at: maybe(iso8601, null),
            labels: nullable(commaSeparated, []),
        }),
    ),
});

eventsDecoder.verify(... /* JSON example from above */);
// => {
//   events: [
//     {
//       id: '1',
//       created_at: new Date('2022-02-01T08:12:29Z'),
//       labels: ['urgent', 'delayed'],
//     },
//     { id: '2', created_at: null, labels: [] },
//     { id: '3', created_at: null, labels: [] },
//   ],
// }
```

## A note on naming

To make decoders maximally useful, refrain from naming decoders after the _field_ they're
used for. **Think of a decoder as the description of a _data type_**, and name them
accordingly. That's why the decoder [in the example above](#putting-it-all-together) is
called `commaSeparated` and not `labelsDecoder` or something like that! In the case of the
`id` field, it happens to be also named `id` because it makes sense to think of it as an
ID _data type_. That the field also happens to be named `id` is a coincidence.

## Keep edge cases outside your decoders

Try to keep `null`s, `undefined`s, or other edge cases outside of the decoder as much as
possible, and instead wrap them in `nullable()`s where you use them in your call
sites---typically in those big `object()` decoders.

Take [the example above](#putting-it-all-together). It would be easy to let the
`commaSeparated` decoder be infected with the `null`-case and handle it too. But this is
less composable. Keeping the `null`-case outside of that decoder makes it a smaller, and
thus a more reusable, building block. It's cheap to wrap it in a `nullable` where you put
it all together.
