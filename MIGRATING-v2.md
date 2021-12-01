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

```typescript
import { summarize } from 'debrief'; // ❌
import { formatShort } from 'decoders/format'; // ✅
```

Lastly:

```typescript
import { annotate, Annotation } from 'debrief'; // ❌
import { annotate, Annotation } from 'decoders/annotate'; // ✅
```

### Remove dependency on `lemons`

Please note: if you use `lemons` outside or unrelated to decoders, don't change those.
Only change the instances where you're using them for decoders.

Rewrite imports as follows:

```typescript
// ❌ Stop doing this
import Result, { Ok, Err } from 'lemons/Result';
import { Result, Ok, Err } from 'lemons';

// Old usage
Ok(...);
Err(...);

// ----------------------------------------------

// ✅ Do this instead
import * as Result from 'decoders/result';

// New usage
Result.ok(...);
Result.err(...);
```

### Changes to the `Result` type

If you have written a type of the form `Result<E, T>` (where E = error, T = success),
these should now be flipped.

Change:

```typescript
Result<E, T>  // ❌ Change this...
Result<T, E>  // ✅ ...to this
```

### `Result` is no longer a class

`Result` is no longer a class. As such, methods previously available on instances no
longer exist. These have been moved to function calls, to support tree-shaking unused
methods from your bundle.

Change:

```typescript
const result = mydecoder(...);

// ❌ These methods no longer exist
result.unwrap();
result.value();
result.errValue();
result.withDefault(...);
result.youGetThePoint();

// ✅ Instead, use functions
import * as Result from 'decoders/result';

Result.unwrap(result);
Result.value(result);
Result.errValue(errValue);
Result.withDefault(...);
Result.youGetThePoint(errValue);
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
