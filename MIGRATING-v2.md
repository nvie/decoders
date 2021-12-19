# Migrating to v2

If you're a normal user of the decoders standard library, you will likely not have to do a
lot to migrate.

The simplest way to upgrade is to run:

    $ npm install decoders@beta

You can also unintall `lemons` and `debrief`, since they are no longer needed as
dependencies[^1]:

    $ npm uninstall lemons
    $ npm uninstall debrief

After this, run TypeScript or Flow on your project. **If no errors pop up, you're already
done migrating! 🎉** Otherwise, continue to follow the instructions below.

## Dependencies

Decoders used to depend on external libraries `lemons` and `debrief`, but this is no
longer the case in v2.

### Remove dependency on `debrief`

Some `debrief` APIs have been moved and renamed to `decoders/format`. Some have been moved
to `decoders/annotate`. If you have them, rewrite your imports as follows:

```typescript
import { serialize } from 'debrief'; // ❌
import { formatInline } from 'decoders/format'; // ✅
```

Simply rename `serialize` to `formatInline`.

The `summarize` helper is replaced by `formatShort`. Please note that its return type has
changed from an array to a single string. It's the equivalent of
`summarize(err).join('\n')`.

```typescript
import { summarize } from 'debrief'; // ❌
summarize(err); // Array<string> ☹️

import { formatShort } from 'decoders/format'; // ✅
formatShort(err); // string 👌
```

Lastly:

```typescript
import { annotate, Annotation } from 'debrief'; // ❌
import { annotate, Annotation } from 'decoders/annotate'; // ✅
```

### Remove dependency on `lemons`

Please note: if you use `lemons` outside or unrelated to decoders, don't change those.
Only change the instances where you're using them for decoders.

```typescript
// ❌ Stop doing this
import Result, { Ok, Err } from 'lemons/Result'; // or
import { Result, Ok, Err } from 'lemons';

Ok(42);
Err('oops');

// ----------------------------------------------

// ✅ Do this instead
import { Result, ok, err } from 'decoders/result';

ok(42);
err('oops');
```

### `Result` is no longer a class

`Result` is no longer a class. As such, methods previously available on instances no
longer exist. These have been moved to function calls, to support tree-shaking unused
methods from your bundle.

Suggested changes:

```typescript
// ✅ Import the helpers you need directly as functions
import { ... } from 'decoders/result';
//       ^^^
//       ✨
```

| Replace usage of          | With ✨                 |     |
| ------------------------- | ----------------------- | --- |
| `result.andThen()`        | `andThen(result)`       |     |
| `result.dispatch()`       | `dispatch(result)`      |     |
| `result.errValue()`       | `result.error`          | ⚠️  |
| `result.expect()`         | `expect(result)`        |     |
| `result.isErr()`          | `result.type === 'err'` | ⚠️  |
| `result.isOk()`           | `result.type === 'ok'`  | ⚠️  |
| `result.map()`            | `mapOk(result)`         | ⚠️  |
| `result.mapError()`       | `mapError(result)`      |     |
| `result.toString()`       | (has been removed)      |     |
| `result.unwrap()`         | `unwrap(result)`        |     |
| `result.value() ?? xxx`   | `result.value ?? xxx`   |     |
| `result.value() \|\| xxx` | `result.value \|\| xxx` |     |
| `result.withDefault(xxx)` | `result.value ?? xxx`   | ⚠️  |

### Changes to the `Result` type

If you have written a type of the form `Result<E, T>` (where E = error, T = success),
these should now be flipped.

Change:

```typescript
Result<E, T>  // ❌ Change this...
Result<T, E>  // ✅ ...to this
```

## `predicate(...)` is now a first-class citizen

`predicate()` is now a first-class citizen, simplifying its typical usage even further.
Where previously you had to use it inside of a `compose()` construct, you no longer need
to.

```typescript
import { compose, number, predicate } from 'decoders';

// ❌ Stop using `compose()` for this
const odd = compose(
    number,
    predicate((n) => n % 2 === 1, 'Must be odd'),
);

// ✅ Do this instead
const odd = predicate(number, (n) => n % 2 === 1, 'Must be odd');
```

## Change `$DecoderType` to `DecoderType` (without the `$`)

The helper type `$DecoderType` has been renamed to `DecoderType`. Just remove the `$`
prefix.

## Change `$GuardType` to `GuardType` (without the `$`)

The helper type `$GuardType` has been renamed to `GuardType`. Just remove the `$` prefix.

## Changes to the Guard API

If you use the (undocumented) second argument to the Guard API, rewrite it as follows:

```typescript
guard(mydecoder, { style: 'simple' });
//               ^^^^^^^^^^^^^^^^^^^ ❌

import { formatShort } from 'decoders/format';
guard(mydecoder, formatShort);
//               ^^^^^^^^^^^ ✅
```

[^1]:
    Only do this if you included them to write decoders. If you use them for other use
    cases, then of course don't remove them!
