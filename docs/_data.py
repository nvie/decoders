#
# This file is the source from which all the Decoders documentation will get
# generated.
#
import copy
import json
import subprocess
from operator import itemgetter

#
# These lists the available decoders, as configured in src/lib/*.js.
#
DECODERS = {
  'string': {
    'section': 'Strings',
    'params': None,
    'return_type': 'Decoder<string>',
    'markdown': """
      Accepts and returns strings.

      ```typescript
      // 👍
      string.verify('hello world') === 'hello world';
      string.verify('🚀') === '🚀';
      string.verify('') === '';

      // 👎
      string.verify(123);   // throws
      string.verify(true);  // throws
      string.verify(null);  // throws
      ```
    """,
  },

  'nonEmptyString': {
    'section': 'Strings',
    'params': None,
    'return_type': 'Decoder<string>',
    'markdown': """
      Like `string`, but will reject the empty string or strings containing only whitespace.

      ```typescript
      // 👍
      nonEmptyString.verify('hello world') === 'hello world';
      nonEmptyString.verify('🚀') === '🚀';

      // 👎
      nonEmptyString.verify(123);   // throws
      nonEmptyString.verify('  ');  // throws
      nonEmptyString.verify('');    // throws
      ```
    """,
  },

  'regex': {
    'section': 'Strings',
    'params': [
      ('pattern', 'RegExp'),
      ('message', 'string'),
    ],
    'return_type': 'Decoder<string>',
    'markdown': """
      Accepts and returns strings that match the given regular expression.

      ```typescript
      const decoder = regex(/^[0-9][0-9]+$/, 'Must be numeric');

      // 👍
      decoder.verify('42') === '42';
      decoder.verify('83401648364738') === '83401648364738';

      // 👎
      decoder.verify('');     // throws
      decoder.verify('1');    // throws
      decoder.verify('foo');  // throws
      ```
    """,
  },

  'email': {
    'section': 'Strings',
    'params': None,
    'return_type': 'Decoder<string>',
    'markdown': """
      Accepts and returns strings that are syntactically valid email addresses. (This will not mean that the email address actually exist.)

      ```typescript
      // 👍
      email.verify('alice@acme.org') === 'alice@acme.org';

      // 👎
      email.verify('foo');               // throws
      email.verify('@acme.org');         // throws
      email.verify('alice @ acme.org');  // throws
      ```
    """,
  },

  'url': {
    'section': 'Strings',
    'params': None,
    'return_type': 'Decoder<URL>',
    'markdown': """
      Accepts strings that are valid URLs, returns the value as a URL instance.

      ```typescript
      // 👍
      url.verify('http://nvie.com') === new URL('http://nvie.com/');
      url.verify('https://nvie.com') === new URL('https://nvie.com/');
      url.verify('git+ssh://user@github.com/foo/bar.git') === new URL('git+ssh://user@github.com/foo/bar.git');

      // 👎
      url.verify('foo');               // throws
      url.verify('@acme.org');         // throws
      url.verify('alice @ acme.org');  // throws
      url.verify('/search?q=foo');     // throws
      ```
    """,
  },

  'httpsUrl': {
    'section': 'Strings',
    'params': None,
    'return_type': 'Decoder<URL>',
    'markdown': """
      Accepts strings that are valid URLs, but only HTTPS ones. Returns the value as a URL instance.

      ```typescript
      // 👍
      httpsUrl.verify('https://nvie.com:443') === new URL('https://nvie.com/');

      // 👎
      httpsUrl.verify('http://nvie.com');                        // throws, not HTTPS
      httpsUrl.verify('git+ssh://user@github.com/foo/bar.git');  // throws, not HTTPS
      ```

      **Tip!** If you need to limit URLs to different protocols than HTTP, you can do as the HTTPS decoder is implemented: by adding further conditions using an [`.and()`](#and) call.

      ```typescript
      import { url } from 'decoders';

      const gitUrl: Decoder<URL> = url.and(
          (value) => value.protocol === 'git:',
          'Must be a git:// URL',
      );
      ```
    """,
  },

  'uuid': {
    'section': 'Strings',
    'params': None,
    'return_type': 'Decoder<string>',
    'markdown': """
      Accepts strings that are valid [UUIDs](https://en.wikipedia.org/wiki/universally_unique_identifier) (universally unique identifier).

      ```typescript
      // 👍
      uuid.verify('123e4567-e89b-12d3-a456-426614174000') === '123e4567-e89b-12d3-a456-426614174000'
      uuid.verify('123E4567-E89B-12D3-A456-426614174000') === '123E4567-E89B-12D3-A456-426614174000'

      // 👎
      uuid.verify('123E4567E89B12D3A456426614174000');      // throws
      uuid.verify('abcdefgh-ijkl-mnop-qrst-uvwxyz012345');  // throws
      ```
    """,
  },

  'uuidv1': {
    'section': 'Strings',
    'params': None,
    'return_type': 'Decoder<URL>',
    'markdown': """
      Like `uuid`, but only accepts [UUIDv1](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_1_%28date-time_and_MAC_address%29) strings.

      ```typescript
      // 👍
      uuidv1.verify('123e4567-e89b-12d3-a456-426614174000') === '123e4567-e89b-42d3-a456-426614174000'

      // 👎
      uuidv1.verify('123e4567-e89b-42d3-a456-426614174000')  // throws
      ```
    """,
  },

  'uuidv4': {
    'section': 'Strings',
    'params': None,
    'return_type': 'Decoder<URL>',
    'markdown': """
      Like `uuid`, but only accepts [UUIDv4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_%28random%29) strings.

      ```typescript
      // 👍
      uuidv4.verify('123e4567-e89b-42d3-a456-426614174000') === '123e4567-e89b-42d3-a456-426614174000'

      // 👎
      uuidv4.verify('123e4567-e89b-12d3-a456-426614174000')  // throws
      ```
    """,
  },

  'number': {
    'section': 'Numbers',
    'params': None,
    'return_type': 'Decoder<number>',
    'markdown': """
      Accepts finite numbers (can be integer or float values). Values `NaN`, or positive and negative `Infinity` will get rejected.

      ```typescript
      // 👍
      number.verify(123) === 123;
      number.verify(-3.14) === -3.14;

      // 👎
      number.verify(Infinity);        // throws
      number.verify(NaN);             // throws
      number.verify('not a number');  // throws
      ```
    """,
  },

  'integer': {
    'section': 'Numbers',
    'params': None,
    'return_type': 'Decoder<number>',
    'markdown': """
      Accepts only finite whole numbers.

      ```typescript
      // 👍
      integer.verify(123) === 123;

      // 👎
      integer.verify(-3.14);           // throws
      integer.verify(Infinity);        // throws
      integer.verify(NaN);             // throws
      integer.verify('not a integer'); // throws
      ```
    """,
  },

  'positiveNumber': {
    'section': 'Numbers',
    'params': None,
    'return_type': 'Decoder<number>',
    'markdown': """
      Accepts only positive finite numbers.

      ```typescript
      // 👍
      positiveNumber.verify(123) === 123;

      // 👎
      positiveNumber.verify(-42);             // throws
      positiveNumber.verify(3.14);            // throws
      positiveNumber.verify(Infinity);        // throws
      positiveNumber.verify(NaN);             // throws
      positiveNumber.verify('not a number');  // throws
      ```
    """,
  },

  'positiveInteger': {
    'section': 'Numbers',
    'params': None,
    'return_type': 'Decoder<number>',
    'markdown': """
      Accepts only positive finite whole numbers.

      ```typescript
      // 👍
      positiveInteger.verify(123) === 123;

      // 👎
      positiveInteger.verify(-3);              // throws
      positiveInteger.verify(3.14);            // throws
      positiveInteger.verify(Infinity);        // throws
      positiveInteger.verify(NaN);             // throws
      positiveInteger.verify('not a number');  // throws
      ```
    """,
  },

  'boolean': {
    'section': 'Booleans',
    'params': None,
    'return_type': 'Decoder<boolean>',
    'markdown': """
      Accepts and returns booleans.

      ```typescript
      // 👍
      boolean.verify(false) === false;
      boolean.verify(true) === true;

      // 👎
      boolean.verify(undefined);      // throws
      boolean.verify('hello world');  // throws
      boolean.verify(123);            // throws
      ```
    """,
  },

  'truthy': {
    'section': 'Booleans',
    'params': None,
    'return_type': 'Decoder<boolean>',
    'markdown': """
      Accepts anything and will return its "truth" value. Will never reject.

      ```typescript
      // 👍
      truthy.verify(false) === false;
      truthy.verify(true) === true;
      truthy.verify(undefined) === false;
      truthy.verify('hello world') === true;
      truthy.verify('false') === true;
      truthy.verify(0) === false;
      truthy.verify(1) === true;
      truthy.verify(null) === false;

      // 👎
      // This decoder will never reject an input
      ```
    """,
  },

  'numericBoolean': {
    'section': 'Booleans',
    'params': None,
    'return_type': 'Decoder<boolean>',
    'markdown': """
      Accepts numbers, but return their boolean representation.

      ```typescript
      // 👍
      numericBoolean.verify(-1) === true;
      numericBoolean.verify(0) === false;
      numericBoolean.verify(123) === true;

      // 👎
      numericBoolean.verify(false);      // throws
      numericBoolean.verify(true);       // throws
      numericBoolean.verify(undefined);  // throws
      numericBoolean.verify('hello');    // throws
      ```
    """,
  },

  'date': {
    'section': 'Dates',
    'params': None,
    'return_type': 'Decoder<Date>',
    'markdown': """
      Accepts and returns [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) instances.

      ```typescript
      const now = new Date();

      // 👍
      date.verify(now) === now;

      // 👎
      date.verify(123);      // throws
      date.verify('hello');  // throws
      ```
    """,
  },

  'iso8601': {
    'section': 'Dates',
    'params': None,
    'return_type': 'Decoder<Date>',
    'markdown': """
      Accepts [ISO8601](https://en.wikipedia.org/wiki/ISO_8601)-formatted strings, returns then as [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) instances.

      This is very useful for working with dates in APIs: serialize them as `.toISOString()` when sending, decode them with `iso8601` when receiving.

      ```typescript
      // 👍
      iso8601.verify('2020-06-01T12:00:00Z'); // ≈ new Date('2020-06-01T12:00:00Z')

      // 👎
      iso8601.verify('2020-06-01');  // throws
      iso8601.verify('hello');       // throws
      iso8601.verify(123);           // throws
      iso8601.verify(new Date());    // throws (does not accept dates)
      ```
    """,
  },

  'constant': {
    'section': 'Constants',
    'type_params': ['T'],
    'params': [('value', 'T')],
    'return_type': 'Decoder<T>',
    'markdown': """
      Accepts only the given constant value.

      ⚠️ **NOTE:** Flow, unlike TypeScript, will not infer constants correctly. In TypeScript, the type of `constant(42)` will correctly be inferred as `Decoder<42>`, but in Flow it will get inferred as `Decoder<number>`. To work around this, you should use this syntax in Flow: `constant((42: 42))`.

      ```typescript
      const decoder = constant('hello');

      // 👍
      decoder.verify('hello') === 'hello';

      // 👎
      decoder.verify('this breaks');  // throws
      decoder.verify(false);          // throws
      decoder.verify(undefined);      // throws
      ```
    """,
  },

  'always': {
    'section': 'Constants',
    'type_params': ['T'],
    'params': [('value', 'T')],
    'return_type': 'Decoder<T>',
    'aliases': ['hardcoded'],
    'markdown': """
      Accepts anything, completely ignores it, and always returns the provided value instead.

      This is useful to manually add extra fields to object decoders.

      ```typescript
      const decoder = always(42);

      // 👍
      decoder.verify('hello') === 42;
      decoder.verify(false) === 42;
      decoder.verify(undefined) === 42;

      // 👎
      // This decoder will never reject an input
      ```
    """,
  },

  'null_': {
    'section': 'Optionality',
    'params': None,
    'return_type': 'Decoder<null>',
    'markdown': """
      Accepts and returns only the literal `null` value.

      ```typescript
      // 👍
      null_.verify(null) === null;

      // 👎
      null_.verify(false);         // throws
      null_.verify(undefined);     // throws
      null_.verify('hello world'); // throws
      ```
    """,
  },

  'undefined_': {
    'section': 'Optionality',
    'params': None,
    'return_type': 'Decoder<undefined>',
    'markdown': """
      Accepts and returns only the literal `undefined` value.

      ```typescript
      // 👍
      undefined_.verify(undefined) === undefined;

      // 👎
      undefined_.verify(null);          // throws
      undefined_.verify(false);         // throws
      undefined_.verify('hello world'); // throws
      ```
    """,
  },

  'optional': {
    'section': 'Optionality',
    'type_params': ['T'],
    'params': [('decoder', 'Decoder<T>')],
    'return_type': 'Decoder<T | undefined>',
    'markdown': """
      Accepts whatever the given decoder accepts, or `undefined`.

      ```typescript
      const decoder = optional(string);

      // 👍
      decoder.verify('hello') === 'hello';
      decoder.verify(undefined) === undefined;

      // 👎
      decoder.verify(null);  // throws
      decoder.verify(0);     // throws
      decoder.verify(42);    // throws
      ```

      A typical case where `optional` is useful is in decoding objects with optional fields:

      ```typescript
      object({
          id: number,
          name: string,
          address: optional(string),
      });
      ```

      Which will decode to type:

      ```typescript
      {
        id: number;
        name: string;
        address?: string;
      }
      ```
    """,
  },

  'nullable': {
    'section': 'Optionality',
    'type_params': ['T'],
    'params': [('decoder', 'Decoder<T>')],
    'return_type': 'Decoder<T | null>',
    'markdown': """
      Accepts whatever the given decoder accepts, or `null`.

      ```typescript
      const decoder = nullable(string);

      // 👍
      decoder.verify('hello') === 'hello';
      decoder.verify(null) === null;

      // 👎
      decoder.verify(undefined);  // throws
      decoder.verify(0);          // throws
      decoder.verify(42);         // throws
      ```
    """,
  },

  'maybe': {
    'section': 'Optionality',
    'type_params': ['T'],
    'params': [('decoder', 'Decoder<T>')],
    'return_type': 'Decoder<T | null | undefined>',
    'markdown': """
      Accepts whatever the given decoder accepts, or `null`, or `undefined`.

      ```typescript
      const decoder = maybe(string);

      // 👍
      decoder.verify('hello') === 'hello';
      decoder.verify(null) === null;
      decoder.verify(undefined) === undefined;

      // 👎
      decoder.verify(0);   // throws
      decoder.verify(42);  // throws
      ```
    """,
  },

  'unknown': {
    'section': 'Optionality',
    'params': None,
    'return_type': 'Decoder<unknown>',
    'aliases': ['mixed'],
    'markdown': """
      Accepts anything and returns it unchanged.

      Useful for situation in which you don't know or expect a specific type. Of course, the downside is that you won't know the type of the value statically and you'll have to further refine it yourself.

      ```typescript
      // 👍
      unknown.verify('hello') === 'hello';
      unknown.verify(false) === false;
      unknown.verify(undefined) === undefined;
      unknown.verify([1, 2]) === [1, 2];

      // 👎
      // This decoder will never reject an input
      ```
    """,
  },

  'array': {
    'section': 'Arrays',
    'params': [('decoder', 'Decoder<T>')],
    'return_type': 'Decoder<T[]>',
    'markdown': """
      Accepts arrays of whatever the given decoder accepts.

      ```typescript
      const decoder = array(string);

      // 👍
      decoder.verify(['hello', 'world']) === ['hello', 'world'];
      decoder.verify([]) === [];

      // 👎
      decoder.verify(['hello', 1.2]);  // throws
      ```
    """,
  },

  'nonEmptyArray': {
    'section': 'Arrays',
    'params': [('decoder', 'Decoder<T>')],
    'return_type': 'Decoder<T[]>',
    'markdown': """
      Like `array()`, but will reject arrays with 0 elements.

      ```typescript
      const decoder = nonEmptyArray(string);

      // 👍
      decoder.verify(['hello', 'world']) === ['hello', 'world'];

      // 👎
      decoder.verify(['hello', 1.2]);  // throws
      decoder.verify([]);              // throws
      ```
    """,
  },

  'poja': {
    'section': 'Arrays',
    'params': None,
    'return_type': 'Decoder<unknown[]>',
    'markdown': """
      Accepts any array, but doesn't validate its items further.

      "poja" means "plain old JavaScript array", a play on `pojo()`.

      ```typescript
      // 👍
      poja.verify([1, 'hi', true]) === [1, 'hi', true];
      poja.verify(['hello', 'world']) === ['hello', 'world'];
      poja.verify([]) === [];

      // 👎
      poja.verify({});    // throws
      poja.verify('hi');  // throws
      ```
    """,
  },

  'tuple': {
    'section': 'Arrays',
    'type_params': ['A', 'B', 'C', '...'],
    'params': [
      (None, 'Decoder<A>'),
      (None, 'Decoder<B>'),
      (None, 'Decoder<C>'),
      (None, '...'),
    ],
    'return_type': 'Decoder<[A, B, C, ...]>',
    'markdown': """
      Accepts a tuple (an array with exactly _n_ items) of values accepted by the _n_ given decoders.

      ```typescript
      const decoder = tuple(string, number);

      // 👍
      decoder.verify(['hello', 1.2]) === ['hello', 1.2];

      // 👎
      decoder.verify([]);                  // throws, too few items
      decoder.verify(['hello', 'world']);  // throws, not the right types
      decoder.verify(['a', 1, 'c']);       // throws, too many items
      ```
    """,
  },

  'set': {
    'section': 'Arrays',
    'type_params': ['T'],
    'params': [('decoder', 'Decoder<T>')],
    'return_type': 'Decoder<Set<T>>',
    'markdown': """
      Similar to [`array()`](#array), but returns the result as an [ES6 Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).

      ```typescript
      const decoder = set(string);

      // 👍
      decoder.verify(['abc', 'pqr'])  // ≈ new Set(['abc', 'pqr'])
      decoder.verify([])              // ≈ new Set([])

      // 👎
      decoder.verify([1, 2]);         // throws, not the right types
      ```
    """,
  },

  'object': {
    'section': 'Objects',
    'type_params': ['A','B', '...'],
    'params': [(None, '{ field1: Decoder<A>, field2: Decoder<B>, ... }')],
    'return_type': 'Decoder<{ field1: A, field2: B, ... }>',
    'markdown': """
      Accepts objects with fields matching the given decoders. Extra fields that exist on the input object are ignored and will not be returned.

      ```typescript
      const decoder = object({
          x: number,
          y: number,
      });

      // 👍
      decoder.verify({ x: 1, y: 2 }) === { x: 1, y: 2 };
      decoder.verify({ x: 1, y: 2, z: 3 }) === { x: 1, y: 2 }; // ⚠️ extra field `z` not returned!

      // 👎
      decoder.verify({ x: 1 });  // throws, missing field `y`
      ```

      For more information, see also [The difference between `object`, `exact`, and `inexact`](./tips.html#the-difference-between-object-exact-and-inexact).
    """,
  },

  'exact': {
    'section': 'Objects',
    'type_params': ['A','B', '...'],
    'params': [(None, '{ field1: Decoder<A>, field2: Decoder<B>, ... }')],
    'return_type': 'Decoder<{ field1: A, field2: B, ... }>',
    'markdown': """
      Like `object()`, but will reject inputs that contain extra keys that are not specified explicitly.

      ```typescript
      const decoder = exact({
          x: number,
          y: number,
      });

      // 👍
      decoder.verify({ x: 1, y: 2 }) === { x: 1, y: 2 };

      // 👎
      decoder.verify({ x: 1, y: 2, z: 3 });  // throws, extra field `z` not allowed
      decoder.verify({ x: 1 });              // throws, missing field `y`
      ```

      For more information, see also [The difference between `object`, `exact`, and `inexact`](./tips.html#the-difference-between-object-exact-and-inexact).
    """,
  },

  'inexact': {
    'section': 'Objects',
    'type_params': ['A','B', '...'],
    'params': [(None, '{ field1: Decoder<A>, field2: Decoder<B>, ... }')],
    'return_type': 'Decoder<{ field1: A, field2: B, ... }>',
    'markdown': """
      Like `object()`, but will pass through any extra fields on the input object unvalidated that will thus be of `unknown` type statically.

      ```typescript
      const decoder = inexact({
          x: number,
      });

      // 👍
      decoder.verify({ x: 1, y: 2 }) === { x: 1, y: 2 };
      decoder.verify({ x: 1, y: 2, z: 3 }) === { x: 1, y: 2, z: 3 };

      // 👎
      decoder.verify({ x: 1 });  // throws, missing field `y`
      ```

      For more information, see also [The difference between `object`, `exact`, and `inexact`](./tips.html#the-difference-between-object-exact-and-inexact).
    """,
  },

  'pojo': {
    'section': 'Objects',
    'params': None,
    'return_type': 'Decoder<{ [key: string]: unknown }>',
    'markdown': """
      Accepts any "plain old JavaScript object", but doesn't validate its keys or values further.

      ```typescript
      // 👍
      pojo.verify({}) === {};
      pojo.verify({ name: 'hi' }) === { name: 'hi' };

      // 👎
      pojo.verify('hi');        // throws
      pojo.verify([]);          // throws
      pojo.verify(new Date());  // throws
      pojo.verify(null);        // throws
      ```
    """,
  },

  # TODO: Rename to "record"
  'dict': {
    'section': 'Objects',
    'type_params': ['T'],
    'params': [('decoder', 'Decoder<T>')],
    'return_type': 'Decoder<{ [key: string]: T }>',
    'markdown': """
      Accepts objects where all values match the given decoder, and returns the result as a `{ [string]: T }`.

      The main difference between `object()` and `dict()` is that you'd typically use `object()` if this is a record-like object, where all field names are known and the values are heterogeneous. Whereas with `dict()` the keys are typically dynamic and the values homogeneous, like in a dictionary, a lookup table, or a cache.

      ```typescript
      const decoder = dict(number);

      // 👍
      decoder.verify({ red: 1, blue: 2, green: 3 }); // ≈ { red: 1, blue: 2, green: 3 }
      ```
    """,
  },

  'mapping': {
    'section': 'Objects',
    'type_params': ['T'],
    'params': [('decoder', 'Decoder<T>')],
    'return_type': 'Decoder<Map<string, T>>',
    'markdown': """
      Similar to `dict()`, but returns the result as a `Map<string, T>` (an [ES6 Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)) instead.

      ```typescript
      const decoder = mapping(number);

      // 👍
      decoder.verify({ red: 1, blue: 2, green: 3 });
      // ≈ Map([
      //     ['red', '1'],
      //     ['blue', '2'],
      //     ['green', '3'],
      //   ]);
      ```
    """,
  },

  'json': {
    'section': 'JSON values',
    'params': None,
    'return_type': 'Decoder<JSONValue>',
    'markdown': """
      Accepts any value that's a valid JSON value.

      In other words: any value returned by `JSON.parse()` should decode without failure.

      - ``null``
      - ``string``
      - ``number``
      - ``boolean``
      - ``{ [string]: JSONValue }``
      - ``JSONValue[]``

      ```typescript
      // 👍
      json.verify({
          name: 'Amir',
          age: 27,
          admin: true,
          image: null,
          tags: ['vip', 'staff'],
      });
      ```
    """,
  },

  'jsonObject': {
    'section': 'JSON values',
    'params': None,
    'return_type': 'Decoder<{ [string]: JSONValue }>',
    'markdown': """
      Like `json`, but will only decode when the JSON value is an object.

      ```typescript
      // 👍
      jsonObject.verify({});                // ≈ {}
      jsonObject.verify({ name: 'Amir' });  // ≈ { name: 'Amir' }

      // 👎
      jsonObject.verify([]);                   // throws
      jsonObject.verify([{ name: 'Alice' }]);  // throws
      jsonObject.verify('hello');              // throws
      jsonObject.verify(null);                 // throws
      ```
    """,
  },

  'jsonArray': {
    'section': 'JSON values',
    'params': None,
    'return_type': 'Decoder<JSONValue[]>',
    'markdown': """
      Like `json`, but will only decode when the JSON value is an array.

      ```typescript
      // 👍
      jsonArray.verify([]);                  // ≈ []
      jsonArray.verify([{ name: 'Amir' }]);  // ≈ [{ name: 'Amir' }]

      // 👎
      jsonArray.verify({});                 // throws
      jsonArray.verify({ name: 'Alice' });  // throws
      jsonArray.verify('hello');            // throws
      jsonArray.verify(null);               // throws
      ```
    """,
  },

  'either': {
    'section': 'Unions',
    'type_params': ['A', 'B', 'C', '...'],
    'params': [
      (None, 'Decoder<A>'),
      (None, 'Decoder<B>'),
      (None, 'Decoder<C>'),
      (None, '...'),
    ],
    'return_type': 'Decoder<A | B | C | ...>',
    'markdown': """
      Accepts values accepted by any of the given decoders. The decoders are tried on the input one by one, in the given order. The first one that accepts the input "wins". If all decoders reject the input, the input gets rejected.

      ```typescript
      const decoder = either(number, string);

      // 👍
      decoder.verify('hello world') === 'hello world';
      decoder.verify(123) === 123;

      // 👎
      decoder.verify(false);  // throws
      ```

      **NOTE to Flow users:** In Flow, there is a max of 9 arguments with this construct. (This is no problem in TypeScript.) If you hit the 9 argument limit, you can work around that by stacking, e.g. do `either(<8 arguments here>, either(...))`.
    """,
  },

  'oneOf': {
    'section': 'Unions',
    'type_params': ['T'],
    'params': [
      ('values', 'T[]'),
    ],
    'return_type': 'Decoder<T>',
    'markdown': """
      Accepts any value that is strictly-equal (using `===`) to one of the specified values.

      ```typescript
      const decoder = oneOf(['foo', 'bar', 3]);

      // 👍
      decoder.verify('foo') === 'foo';
      decoder.verify(3) === 3;

      // 👎
      decoder.verify('hello');  // throws
      decoder.verify(4);        // throws
      decoder.verify(false);    // throws
      ```

      For example, given an array of strings, like so:

      ```typescript
      oneOf(['foo', 'bar']);
      ```

      **NOTE to Flow users:** TypeScript is capable of inferring the return type as `Decoder<'foo' | 'bar'>`, but in Flow it will (unfortunately) be `Decoder<string>`. So in Flow, be sure to explicitly annotate the type. Either by doing `oneOf([('foo': 'foo'), ('bar': 'bar')])`, or as `oneOf<'foo' | 'bar'>(['foo', 'bar'])`.
    """,
  },

  'taggedUnion': {
    'section': 'Unions',
    'type_params': ['A', 'B', '...'],
    'params': [
      ('field', 'string'),
      ('mapping', '{ value1: Decoder<A>, value2: Decoder<B>, ... }'),
    ],
    'return_type': 'Decoder<A | B | ...>',
    'markdown': """
      **NOTE:** In decoders@1.x, this was called `dispatch()`.

      Like `either`, but optimized for building [tagged unions](https://en.wikipedia.org/wiki/Tagged_union) of object types with a common field (like a `type` field) that lets you distinguish members.

      The following two decoders are effectively equivalent:

      ```typescript
      type Rect = { __type: 'rect', x: number, y: number, width: number, height: number };
      type Circle = { __type: 'circle', cx: number, cy: number, r: number };
      //              ^^^^^^
      //              Field that defines which decoder to pick
      //                                               vvvvvv
      const shape1: Decoder<Rect | Circle> = taggedUnion('__type', { rect, circle });
      const shape2: Decoder<Rect | Circle> = either(rect, circle);
      ```

      But using `taggedUnion()` will typically be more runtime-efficient than using `either()`. The reason is that `taggedUnion()` will first do minimal work to "look ahead" into the `type` field here, and based on that value, pick which decoder to invoke. Error messages will then also be tailored to the specific decoder.

      The `either()` version will instead try each decoder in turn until it finds one that matches. If none of the alternatives match, it needs to report all errors, which is sometimes confusing.
    """,
  },

  'define': {
    'section': 'Utilities',
    'type_params': ['T'],
    'params': [
      ('fn', '(blob: unknown, accept, reject) => T'),
    ],
    'return_type': 'Decoder<T>',
    'markdown': """
      Defines a new `Decoder<T>`, by implementing a custom accept function. The function receives three arguments:

      1. The raw/unknown input (aka your external data)
      2. An `accept()` callback
      3. A `reject()` callback

      The expected return value should be a `DecodeResult<T>`, which can be created by calling one of the provided callback functions.

      ```typescript
      // NOTE: Please do NOT implement an uppercase decoder like this! 😇
      const uppercase: Decoder<string> = define(
        (blob, accept, reject) =>
          (typeof blob === 'string')
            ? accept(blob.toUpperCase())
            : reject('I only accept strings as input')
      );

      // 👍
      uppercase.verify('hi there') === 'HI THERE';

      // 👎
      uppercase.verify(123);   // throws: 123
                               //         ^^^ I only accept strings as input
      ```

      The above example is just an example to illustrate how `define()` works. It would be more idiomatic to implement an uppercase decoder as follows:

      ```ts
      const uppercase: Decoder<string> = string.transform(s => s.toUpperCase());
      ```
    """,
  },

  'prep': {
    'section': 'Utilities',
    'type_params': ['T'],
    'params': [
      ('mapperFn', '(raw: mixed) => mixed'),
      ('decoder', 'Decoder<T>'),
    ],
    'return_type': 'Decoder<T>',
    'markdown': """
      Pre-process the raw data input before passing it into the decoder. This gives you the ability to arbitrarily customize the input on the fly before passing it to the decoder. Of course, the input value at that point is still of `unknown` type, so you will have to deal with that accordingly.

      ```typescript
      const decoder = prep(
        // Will convert any input to an int first, before feeding it to
        // positiveInteger. This will effectively also allow numeric strings
        // to be accepted (and returned) as integers. If this ever throws,
        // then the error message will be what gets annotated on the input.
        x => parseInt(x),
        positiveInteger,
      );

      // 👍
      decoder.verify(42) === 42;
      decoder.verify('3') === 3;

      // 👎
      decoder.verify('-3');  // throws: not a positive number
      decoder.verify('hi');  // throws: not a number
      ```
    """,
  },

  'never': {
    'section': 'Utilities',
    'params': None,
    'return_type': 'Decoder<never>',
    'aliases': ['fail'],
    'markdown': """
      Rejects all inputs, and always fails with the given error message. May be useful for explicitly disallowing keys, or for testing purposes.

      ```typescript
      const decoder = object({
        a: string,
        b: optional(never('Key b has been removed')),
      });

      // 👍
      decoder.verify({ a: 'foo' });            // ≈ { a: 'foo' };
      decoder.verify({ a: 'foo', c: 'bar' });  // ≈ { a: 'foo' };

      // 👎
      decoder.verify({ a: 'foo', b: 'bar' });  // throws
      ```
    """,
  },

  'instanceOf': {
    'section': 'Utilities',
    'type_params': ['T'],
    'params': [
      ('klass', 'Class<T>'),
    ],
    'return_type': 'Decoder<T>',
    'markdown': """
      Accepts any value that is an `instanceof` the given class.

      ```typescript
      const decoder = instanceOf(Error);

      // 👍
      const value = new Error('foo');
      decoder.verify(value) === value;

      // 👎
      decoder.verify('foo');  // throws
      decoder.verify(3);      // throws
      ```
    """,
  },

  'lazy': {
    'section': 'Utilities',
    'type_params': ['T'],
    'params': [
      ('decoderFn', '() => Decoder<T>'),
    ],
    'return_type': 'Decoder<T>',
    'markdown': """
      Lazily evaluate the given decoder. This is useful to build self-referential types for recursive data structures. Example:

      ```typescript
      type Tree = {
          value: string;
          children: Array<Tree>;
          //              ^^^^
          //              Self-reference defining a recursive type
      };

      const treeDecoder: Decoder<Tree> = object({
          value: string,
          children: array(lazy(() => treeDecoder)),
          //              ^^^^^^^^^^^^^^^^^^^^^^^
          //              Use lazy() like this to refer to the treeDecoder which is
          //              getting defined here
      });
      ```
    """,
  },
}

#
# These lists the methods, as configured in src/_decoder.js.
#
DECODER_METHODS = {
  'verify': {
    'params': [('blob', 'mixed')],
    'return_type': 'T',
    'markdown': """
      Verified the (raw/untrusted/unknown) input and either accepts or rejects it. When accepted, returns the decoded `T` value directly. Otherwise fail with a runtime error.

      For example, take this simple "number" decoder.

      ```typescript
      // 👍
      number.verify(3);     // 3

      // 👎
      number.verify('hi');  // throws
      ```
    """,
  },

  'decode': {
    'params': [('blob', 'mixed')],
    'return_type': 'DecodeResult<T>',
    'markdown': """
      Validates the raw/untrusted/unknown input and either accepts or rejects it.

      Contrasted with `.verify()`, calls to `.decode()` will never fail and instead return a result type.

      For example, take this simple “number” decoder. When given an number value, it will return an ok: true result. Otherwise, it will return an ok: false result with the original input value annotated.

      ```typescript
      // 👍
      number.decode(3);     // { ok: true, value: 3 };

      // 👎
      number.decode('hi');  // { ok: false, error: { type: 'scalar', value: 'hi', text: 'Must be number' } }
      ```
    """,
  },

  'and': {
    'params': [
      ('predicate', 'T => boolean'),
      ('message', 'string'),
    ],
    'return_type': 'Decoder<T>',
    'markdown': """
      Adds an extra predicate to a decoder. The new decoder is like the original decoder, but only accepts values that also meet the predicate.

      ```typescript
      const odd = number.and(
        (n) => n % 2 !== 0,
        'Must be odd'
      );

      // 👍
      odd.verify(3) === 3;

      // 👎
      odd.verify(42);    // throws: not an odd number
      odd.verify('hi');  // throws: not a number
      ```

      In TypeScript, if you provide a predicate that also is a [type predicate](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates), then this will be reflected in the return type, too.
    """,
  },

  'chain': {
    'type_params': ['V'],
    'params': [
      ('nextDecodeFn', 'T => DecodeFn<V, T>'),
    ],
    'return_type': 'Decoder<V>',
    'markdown': """
      Chain together the current decoder with the given decode function. The given function will only get called after the current decoder accepts an input.

      The given "next" decoding function will thus be able to make more assumptions about its input value, i.e. it can know what type the input value is (`T` instead of ``unknown``).

      This is an advanced decoder, typically only useful for authors of decoders. It's not recommended to rely on this decoder directly for normal usage.  In most cases, `.transform()` is what you'll want instead.
    """,
  },

  'transform': {
    'type_params': ['V'],
    'params': [
        ('transformFn', '(T) => V'),
    ],
    'return_type': 'Decoder<V>',
    'markdown': """
      Accepts any value the given decoder accepts, and on success, will call the given function **on the decoded result**. If the transformation function throws an error, the whole decoder will fail using the error message as the failure reason.

      ```typescript
      const upper = string.transform((s) => s.toUpperCase());

      // 👍
      upper.verify('foo') === 'FOO'

      // 👎
      upper.verify(4);  // throws
      ```
    """,
  },

  'describe': {
    'params': [
        ('message', 'string'),
    ],
    'return_type': 'Decoder<T>',
    'markdown': """
      Uses the given decoder, but will use an alternative error message in case it rejects. This can be used to simplify or shorten otherwise long or low-level/technical errors.

      ```typescript
      const decoder = either(
          constant('a'),
          constant('e'),
          constant('i'),
          constant('o'),
          constant('u'),
      );
      const vowel = decoder.describe('Must be vowel');
      ```
    """,
  },
}


def find(xs, predicate):
    for x in xs:
        if predicate(x):
            return x
    return None


def run_json(cmd):
    proc = subprocess.run(cmd, shell=True, encoding='utf-8', capture_output=True)
    if proc.returncode != 0:
      print(proc.stderr)
      proc.check_returncode()

    output = proc.stdout.strip()
    return json.loads(output)


def find_source_locations():
    locinfo1 = run_json(
      "./bin/linenos src/_decoder.js --remote-url --object-keys --object-methods --json",
    )
    locinfo2 = run_json(
      "./bin/linenos src/*.js src/**/*.js --remote-url --functions --variables --json",
    )

    # Check the definitions against the found sources
    for method in DECODER_METHODS:
      if not any(loc['name'] == method for loc in locinfo1):
        raise Exception(f'Decoder method ".{method}()" not found in source code')

    for name in DECODERS:
      if not any(loc['name'] == name for loc in locinfo2):
        raise Exception(f'Decoder "{name}" not found in source code')

    locations = { }
    for info in locinfo1:
      locations[info['name']] = info['remote']
    for info in locinfo2:
      locations[info['name']] = info['remote']
    return locations


LOCATIONS = find_source_locations()


def expand_aliases():
  ALIASES = {}

  for name, decoder in DECODERS.items():
    for alias_name in decoder.get('aliases', []):
      alias_info = copy.deepcopy(decoder)
      del alias_info['aliases']
      alias_info['alias_of'] = name
      ALIASES[alias_name] = alias_info

  for name, decoder in ALIASES.items():
    DECODERS[name] = decoder


def group_by(iterable, keyval):
  lut = {}
  for value in iterable:
      k, v = keyval(value)
      try:
          s = lut[k]
      except KeyError:
          s = lut[k] = list()
      s.append(v)
  return lut


expand_aliases()
DECODERS_BY_SECTION = group_by(DECODERS.items(), lambda tup: (tup[1]['section'], tup[0]))
