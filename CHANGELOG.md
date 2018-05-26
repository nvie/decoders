v1.6.1
------
- Upgraded debrief dependency
- Behave better in projects that have Flow's `experimental.const_params`
  setting turned on


v1.6.0
------
- **New decoders!**
  - `exact()` is like `object()`, but will fail if the inputted object contains
    superfluous keys (keys that aren't in the object definition).


v1.5.0
------
- Collect and report all nested errors in an object() at once (rather than
  error on the first error).

**Breaking:**

- Remove deprecated `message` argument to `object()`


v1.4.6
------
- Add missing documentation


v1.4.5
------
- Upgrade second-level dependencies


v1.4.4
------
- Declare library to be side effect free (to help optimize webpack v4 builds)
- Upgrade dependencies


v1.4.1
------
- Improve internals of the error message serializer (debrief)


v1.4.0
------
- **New decoders!**
  - `email` validator based on the [almost perfect email regex](http://emailregex.com/)
  - `url` validator for validating HTTPS URLs (most common use case)
  - `anyUrl` validator for validating any URL scheme


v1.3.1
------
- Fix bug where dates, or arrays (or any other Object subclass) could pass for
  a record with merely optional fields.


v1.3.0
------
- Much improved error messages!  They were redesigned to look great in
  terminals and to summarize only the relevant bits of the error message,
  striking a balance between all the details and the high level summary.


v1.2.4
------
- **New features**:
  - `truthy` takes any input and returns whether the value is truthy
  - `numericBoolean` takes only numbers as input, and returns their boolean
    interpretation (0 = false, non-0 = true)


v1.2.2, v1.2.3
--------------
- **New feature** `mixed` decoder, for unverified pass-thru of any values


v1.2.1
------
- **Fix** Expose the following decoders publicly:
  - `integer`
  - `positiveInteger`
  - `positiveNumber`


v1.2.0
------
- **New feature** `regex()`, for building custom string decoders
- Tiny tweaks to improve error messages (more structural improvements are on
  the roadmap)


v1.1.0
------
- Expose pojo() decoder, for plain old objects (with mixed contents)
- Expose poja() decoder, for plain old arrays (with mixed contents)
- Perf: make `tuple2()` decoder lazier


v1.0.1
------
- Expose new "either" decoders at the too level


v1.0.0
------
- **BREAKING** Removes the old public ("compat") API
- Finalize/settle on public API


v0.1.3
------
- Add whole series for either, either3, either4, ..., either9
- Updated dev dependencies


v0.1.2
------
- Add `date` decoder, which decodes `Date` instances
- Improve error output detail when throwing errors


v0.1.1
------
- Export `g2d()` helper function that can help adoption to new-style APIs by
  converting old-style decoders (now called guards) to new-style decoders.


v0.1.0
------
- **Breaking change** New API: simplified names, split up decoders from guards.
  What used to be called "decoders" in 0.0.x ("things that either return
  a value or throw a runtime error") are now called "guards" in 0.1.0.
  The meaning of the term "decoders" is now changed to a thing that either is
  an "Ok" value or an "Err" value.

  To convert to the new API, do this:

  ```javascript
  // Old way
  import { decodeNumber, decodeObject, decodeString } from 'decoders';

  const decoder = decodeObject({
      name: decodeString(),
      age: decodeNumber(),
  });

  // -------------------------------------------------------------------

  // New way
  import { guard, number, object, string } from 'decoders';

  const guard = guard(object({
      name: string,
      age: number,
  }));
  ```

