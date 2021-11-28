# Migrating to v2

If you're a normal user of the decoders standard library, you will likely not have to do a
lot to migrate.

The simplest way to upgrade is to run:

    $ npm install decoders@^2.0.0

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

The following `debrief` APIs have been moved. If you have them, rewrite your imports as
follows:

```typescript
import { serialize, summarize } from 'debrief'; // ❌
import { serialize, summarize } from 'decoders/format'; // ✅
```

Or:

```typescript
import { annotate, Annotation } from 'debrief'; // ❌
import { annotate, Annotation } from 'decoders/annotate'; // ✅
```

### Remove dependency on `lemons`

Please note: if you use `lemons` outside or unrelated to decoders, don't change those.
Only change the instances where you're using them for decoders.

Rewrite imports as follows:

```typescript
import Result, { Ok, Err } from 'lemons/Result'; // ❌ Stop doing this
import { Result, Ok, Err } from 'lemons'; //        ❌ or this

import * as Result from 'decoders/lib/Result'; //   ✅ Do this instead

// Change usage like so:
Ok(42); // ❌
Result.ok(42); // ✅
```

### Changes to the `Result` type

If you have written a type of the form `Result<E, T>` (where E = error, T = success),
these should now be flipped.

Change:

```typescript
Result<E, T>  // ❌ Change this...
Result<T, E>  // ✅ ...to this
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
