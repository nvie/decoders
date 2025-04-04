#
# This file is the source from which all the Decoders documentation will get
# generated.
#
import copy
import json
import subprocess
from operator import itemgetter

#
# These lists the available decoders, as configured in src/*.ts.
#
DECODERS = {
  'string': {
    'section': 'Strings',
    'params': None,
    'return_type': 'Decoder<string>',
    'example': """
      // 👍
      string.verify('hello world') === 'hello world';
      string.verify('🚀') === '🚀';
      string.verify('') === '';

      // 👎
      string.verify(123);   // throws
      string.verify(true);  // throws
      string.verify(null);  // throws
    """,
  },

  'nonEmptyString': {
    'section': 'Strings',
    'params': None,
    'return_type': 'Decoder<string>',
    'example': """
      // 👍
      nonEmptyString.verify('hello world') === 'hello world';
      nonEmptyString.verify('🚀') === '🚀';

      // 👎
      nonEmptyString.verify(123);   // throws
      nonEmptyString.verify('  ');  // throws
      nonEmptyString.verify('');    // throws
    """,
  },

  'regex': {
    'section': 'Strings',
    'params': [
      ('pattern', 'RegExp'),
      ('message', 'string'),
    ],
    'return_type': 'Decoder<string>',
    'example': """
      const decoder = regex(/^[0-9][0-9]+$/, 'Must be numeric');

      // 👍
      decoder.verify('42') === '42';
      decoder.verify('83401648364738') === '83401648364738';

      // 👎
      decoder.verify('');     // throws
      decoder.verify('1');    // throws
      decoder.verify('foo');  // throws
    """,
  },

  'startsWith': {
    'section': 'Strings',
    'params': [
      ('prefix', 'P'),
    ],
    'return_type': 'Decoder<\\`${P}${string}\\`>',
    'example': """
      const decoder = startsWith('abc');

      // 👍
      decoder.verify('abc') === 'abc';
      decoder.verify('abcdefg') === 'abcdefg';

      // 👎
      decoder.verify(42);     // throws
      decoder.verify('ab');   // throws
      decoder.verify('ABC');  // throws
    """,
  },

  'endsWith': {
    'section': 'Strings',
    'params': [
      ('suffix', 'S'),
    ],
    'return_type': 'Decoder<\\`${string}${S}\\`>',
    'example': """
      const decoder = endsWith('bar');

      // 👍
      decoder.verify('bar') === 'bar';
      decoder.verify('foobar') === 'foobar';

      // 👎
      decoder.verify(42);      // throws
      decoder.verify('Bar');   // throws
      decoder.verify('bark');  // throws
    """,
  },

  'decimal': {
    'section': 'Strings',
    'return_type': 'Decoder<string>',
    'example': """
      const decoder = decimal;

      // 👍
      decoder.verify('42') === '42';
      decoder.verify('83401648364738') === '83401648364738';

      // 👎
      decoder.verify('');        // throws
      decoder.verify('123abc');  // throws
      decoder.verify('foo');     // throws
      decoder.verify(123);       // throws (not a string)
    """,
  },

  'hexadecimal': {
    'section': 'Strings',
    'return_type': 'Decoder<string>',
    'example': """
      const decoder = hexadecimal;

      // 👍
      decoder.verify('0123456789ABCDEF') === '0123456789ABCDEF';
      decoder.verify('deadbeef') === 'deadbeef';

      // 👎
      decoder.verify('abcdefghijklm');  // throws (not hexadecimal)
      decoder.verify('');     // throws
      decoder.verify('1');    // throws
    """,
  },

  'numeric': {
    'section': 'Strings',
    'return_type': 'Decoder<number>',
    'example': """
      const decoder = numeric;

      // 👍
      decoder.verify('42') === 42;
      decoder.verify('83401648364738') === 83401648364738;

      // 👎
      decoder.verify('');        // throws
      decoder.verify('123abc');  // throws
      decoder.verify('foo');     // throws
      decoder.verify(123);       // throws (not a string)
    """,
  },

  'email': {
    'section': 'Strings',
    'params': None,
    'return_type': 'Decoder<string>',
    'example': """
      // 👍
      email.verify('alice@acme.org') === 'alice@acme.org';

      // 👎
      email.verify('foo');               // throws
      email.verify('@acme.org');         // throws
      email.verify('alice @ acme.org');  // throws
    """,
  },

  'url': {
    'section': 'Strings',
    'params': None,
    'return_type': 'Decoder<URL>',
    'example': """
      // 👍
      url.verify('http://nvie.com') === new URL('http://nvie.com/');
      url.verify('https://nvie.com') === new URL('https://nvie.com/');
      url.verify('git+ssh://user@github.com/foo/bar.git') === new URL('git+ssh://user@github.com/foo/bar.git');

      // 👎
      url.verify('foo');               // throws
      url.verify('@acme.org');         // throws
      url.verify('alice @ acme.org');  // throws
      url.verify('/search?q=foo');     // throws
    """,
  },

  'httpsUrl': {
    'section': 'Strings',
    'params': None,
    'return_type': 'Decoder<URL>',
    'example': """
      ```ts
      // 👍
      httpsUrl.verify('https://nvie.com:443') === new URL('https://nvie.com/');

      // 👎
      httpsUrl.verify('http://nvie.com');                        // throws, not HTTPS
      httpsUrl.verify('git+ssh://user@github.com/foo/bar.git');  // throws, not HTTPS
      ```

      **Tip!** If you need to limit URLs to different protocols than HTTP, you can do as the HTTPS decoder is implemented: by adding further conditions using a `.refine()` call.

      ```ts
      import { url } from 'decoders';

      const gitUrl: Decoder<URL> = url.refine(
        (value) => value.protocol === 'git:',
        'Must be a git:// URL',
      );
      ```
    """,
  },

  'identifier': {
    'section': 'Strings',
    'params': None,
    'return_type': 'Decoder<string>',
    'example': """
      // 👍
      identifier.verify('x') === 'x'
      identifier.verify('abc123') === 'abc123'
      identifier.verify('_123') === '_123'
      identifier.verify('a_b_c_1_2_3') === 'a_b_c_1_2_3'

      // 👎
      identifier.verify('123xyz');   // cannot start with digit
      identifier.verify('x-y');      // invalid chars
      identifier.verify('!@#$%^&*()=+');  // invalid chars
      identifier.verify('🤯');       // invalid chars
      identifier.verify(42);         // not a string
    """,
  },

  'nanoid': {
    'section': 'Strings',
    'params': None,
    'return_type': 'Decoder<string>',
    'example': """
      // 👍
      nanoid().verify('1-QskICa3CaPGcKuYYTm1') === '1-QskICa3CaPGcKuYYTm1'
      nanoid().verify('vA4mt7CUWnouU6jTGbMP_') === 'vA4mt7CUWnouU6jTGbMP_'
      nanoid({ size: 7 }).verify('yH8mx-7') === 'yH8mx-7'
      nanoid({ min: 7, max: 10 }).verify('yH8mx-7') === 'yH8mx-7'
      nanoid({ min: 7, max: 10 }).verify('yH8mx-7890') === 'yH8mx-7890'

      // 👎
      nanoid().verify('123E4567E89B12D3A456426614174000'); // too long
      nanoid().verify('abcdefghijkl');                     // too short
      nanoid().verify('$*&(#%*&(');                        // invalid chars
    """,
  },

  'uuid': {
    'section': 'Strings',
    'params': None,
    'return_type': 'Decoder<string>',
    'example': """
      // 👍
      uuid.verify('123e4567-e89b-12d3-a456-426614174000') === '123e4567-e89b-12d3-a456-426614174000'
      uuid.verify('123E4567-E89B-12D3-A456-426614174000') === '123E4567-E89B-12D3-A456-426614174000'

      // 👎
      uuid.verify('123E4567E89B12D3A456426614174000');      // throws
      uuid.verify('abcdefgh-ijkl-mnop-qrst-uvwxyz012345');  // throws
    """,
  },

  'uuidv1': {
    'section': 'Strings',
    'params': None,
    'return_type': 'Decoder<URL>',
    'example': """
      // 👍
      uuidv1.verify('123e4567-e89b-12d3-a456-426614174000') === '123e4567-e89b-42d3-a456-426614174000'

      // 👎
      uuidv1.verify('123e4567-e89b-42d3-a456-426614174000')  // throws
    """,
  },

  'uuidv4': {
    'section': 'Strings',
    'params': None,
    'return_type': 'Decoder<URL>',
    'example': """
      // 👍
      uuidv4.verify('123e4567-e89b-42d3-a456-426614174000') === '123e4567-e89b-42d3-a456-426614174000'

      // 👎
      uuidv4.verify('123e4567-e89b-12d3-a456-426614174000')  // throws
    """,
  },

  'number': {
    'section': 'Numbers',
    'params': None,
    'return_type': 'Decoder<number>',
    'example': """
      // 👍
      number.verify(123) === 123;
      number.verify(-3.14) === -3.14;

      // 👎
      number.verify(Infinity);        // throws
      number.verify(NaN);             // throws
      number.verify('not a number');  // throws
    """,
  },

  'integer': {
    'section': 'Numbers',
    'params': None,
    'return_type': 'Decoder<number>',
    'example': """
      // 👍
      integer.verify(123) === 123;

      // 👎
      integer.verify(-3.14);           // throws
      integer.verify(Infinity);        // throws
      integer.verify(NaN);             // throws
      integer.verify('not a integer'); // throws
    """,
  },

  'positiveNumber': {
    'section': 'Numbers',
    'params': None,
    'return_type': 'Decoder<number>',
    'example': """
      // 👍
      positiveNumber.verify(123) === 123;
      positiveNumber.verify(3.14) === 3.14;
      positiveNumber.verify(0) === 0;

      // 👎
      positiveNumber.verify(-42);             // throws
      positiveNumber.verify(Infinity);        // throws
      positiveNumber.verify(NaN);             // throws
      positiveNumber.verify('not a number');  // throws
      positiveNumber.verify(-0);              // throws
    """,
  },

  'positiveInteger': {
    'section': 'Numbers',
    'params': None,
    'return_type': 'Decoder<number>',
    'example': """
      // 👍
      positiveInteger.verify(123) === 123;
      positiveInteger.verify(0) === 0;

      // 👎
      positiveInteger.verify(-3);              // throws
      positiveInteger.verify(3.14);            // throws
      positiveInteger.verify(Infinity);        // throws
      positiveInteger.verify(NaN);             // throws
      positiveInteger.verify('not a number');  // throws
      positiveInteger.verify(-0);              // throws
    """,
  },

  'anyNumber': {
    'section': 'Numbers',
    'params': None,
    'return_type': 'Decoder<number>',
    'example': """
      // 👍
      anyNumber.verify(123) === 123;
      anyNumber.verify(-3.14) === -3.14;
      anyNumber.verify(Infinity) === Infinity;
      anyNumber.verify(NaN) === NaN;

      // 👎
      anyNumber.verify('not a number');  // throws
    """,
  },

  'bigint': {
    'section': 'Numbers',
    'params': None,
    'return_type': 'Decoder<bigint>',
    'example': """
      // 👍
      bigint.verify(123n) === 123n;
      bigint.verify(-4543000000n) === -4543000000n;

      // 👎
      bigint.verify(123);             // throws
      bigint.verify(-3.14);           // throws
      bigint.verify(Infinity);        // throws
      bigint.verify(NaN);             // throws
      bigint.verify('not a number');  // throws
    """,
  },

  'boolean': {
    'section': 'Booleans',
    'params': None,
    'return_type': 'Decoder<boolean>',
    'example': """
      // 👍
      boolean.verify(false) === false;
      boolean.verify(true) === true;

      // 👎
      boolean.verify(undefined);      // throws
      boolean.verify('hello world');  // throws
      boolean.verify(123);            // throws
    """,
  },

  'truthy': {
    'section': 'Booleans',
    'params': None,
    'return_type': 'Decoder<boolean>',
    'example': """
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
    """,
  },

  'date': {
    'section': 'Dates',
    'params': None,
    'return_type': 'Decoder<Date>',
    'example': """
      const now = new Date();

      // 👍
      date.verify(now) === now;

      // 👎
      date.verify(123);      // throws
      date.verify('hello');  // throws
    """,
  },

  'dateString': {
    'section': 'Dates',
    'params': None,
    'return_type': 'Decoder<string>',
    'example': """
      // 👍
      dateString.verify('2020-06-01T12:00:00Z');

      // 👎
      dateString.verify('2020-06-01');  // throws
      dateString.verify('hello');       // throws
      dateString.verify(123);           // throws
      dateString.verify(new Date());    // throws (does not accept dates)
    """,
  },

  'iso8601': {
    'section': 'Dates',
    'params': None,
    'return_type': 'Decoder<Date>',
    'example': """
      // 👍
      iso8601.verify('2020-06-01T12:00:00Z'); // new Date('2020-06-01T12:00:00Z')

      // 👎
      iso8601.verify('2020-06-01');  // throws
      iso8601.verify('hello');       // throws
      iso8601.verify(123);           // throws
      iso8601.verify(new Date());    // throws (does not accept dates)
    """,
  },

  'datelike': {
    'section': 'Dates',
    'params': None,
    'return_type': 'Decoder<Date>',
    'example': """
      // 👍
      datelike.verify('2024-01-08T12:00:00Z'); // strings...
      datelike.verify(new Date());             // ...or Date instances

      // 👎
      datelike.verify('2020-06-01');  // throws
      datelike.verify('hello');       // throws
      datelike.verify(123);           // throws
    """,
  },

  'constant': {
    'section': 'Constants',
    'type_params': ['T'],
    'params': [('value', 'T')],
    'return_type': 'Decoder<T>',
    'example': """
      const decoder = constant('hello');

      // 👍
      decoder.verify('hello') === 'hello';

      // 👎
      decoder.verify('this breaks');  // throws
      decoder.verify(false);          // throws
      decoder.verify(undefined);      // throws
    """,
  },

  'always': {
    'section': 'Constants',
    'type_params': ['T'],
    'params': [('value', 'T')],
    'return_type': 'Decoder<T>',
    'aliases': ['hardcoded'],
    'example': """
      ```ts
      const decoder = always(42);

      // 👍
      decoder.verify('hello') === 42;
      decoder.verify(false) === 42;
      decoder.verify(undefined) === 42;

      // 👎
      // This decoder will never reject an input
      ```

      Or use it with a function instead of a constant:

      ```ts
      const now = always(() => new Date());

      now.verify('dummy');  // e.g. new Date('2022-02-07T09:36:58.848Z')
      ```
    """,
  },

  'null_': {
    'section': 'Optionality',
    'params': None,
    'return_type': 'Decoder<null>',
    'example': """
      // 👍
      null_.verify(null) === null;

      // 👎
      null_.verify(false);         // throws
      null_.verify(undefined);     // throws
      null_.verify('hello world'); // throws
    """,
  },

  'undefined_': {
    'section': 'Optionality',
    'params': None,
    'return_type': 'Decoder<undefined>',
    'example': """
      // 👍
      undefined_.verify(undefined) === undefined;

      // 👎
      undefined_.verify(null);          // throws
      undefined_.verify(false);         // throws
      undefined_.verify('hello world'); // throws
    """,
  },

  'optional': {
    'section': 'Optionality',

    'signatures': [
      {
        'type_params': ['T'],
        'params': [('decoder', 'Decoder<T>')],
        'return_type': 'Decoder<T | undefined>',
      },
      {
        'type_params': ['T', 'V'],
        'params': [
          ('decoder', 'Decoder<T>'),
          ('defaultValue', 'V | (() => V)'),
        ],
        'return_type': 'Decoder<T | V>',
        },
    ],

    'example': """
      ```ts
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

      ```ts
      object({
        id: number,
        name: string,
        address: optional(string),
      });
      ```

      Which will decode to type:

      ```ts
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

    'signatures': [
      {
        'type_params': ['T'],
        'params': [('decoder', 'Decoder<T>')],
        'return_type': 'Decoder<T | null>',
      },
      {
        'type_params': ['T', 'V'],
        'params': [
          ('decoder', 'Decoder<T>'),
          ('defaultValue', 'V | (() => V)'),
        ],
        'return_type': 'Decoder<T | V>',
      },
    ],

    'example': """
      ```ts
      const decoder = nullable(string);

      // 👍
      decoder.verify('hello') === 'hello';
      decoder.verify(null) === null;

      // 👎
      decoder.verify(undefined);  // throws
      decoder.verify(0);          // throws
      decoder.verify(42);         // throws
      ```

      Or use it with a default value:

      ```ts
      const decoder = nullable(iso8601, () => new Date());

      decoder.verify('2022-01-01T12:00:00Z') === '2022-01-01T12:00:00Z';
      decoder.verify(null);  // the current date
      ```
    """,
  },

  'nullish': {
    'section': 'Optionality',
    'aliases': ['maybe'],

    'signatures': [
      {
        'type_params': ['T'],
        'params': [('decoder', 'Decoder<T>')],
        'return_type': 'Decoder<T | null | undefined>',
      },
      {
        'type_params': ['T', 'V'],
        'params': [
          ('decoder', 'Decoder<T>'),
          ('defaultValue', 'V | (() => V)'),
        ],
        'return_type': 'Decoder<T | V>',
      },
    ],

    'example': """
      ```ts
      const decoder = nullish(string);

      // 👍
      decoder.verify('hello') === 'hello';
      decoder.verify(null) === null;
      decoder.verify(undefined) === undefined;

      // 👎
      decoder.verify(0);   // throws
      decoder.verify(42);  // throws
      ```

      Or use it with a default value:

      ```ts
      const decoder = nullish(string, null);

      decoder.verify('hello') === 'hello';
      decoder.verify(null) === null;
      decoder.verify(undefined) === null;
      ```
    """,
  },

  'unknown': {
    'section': 'Optionality',
    'params': None,
    'return_type': 'Decoder<unknown>',
    'aliases': ['mixed'],
    'example': """
      // 👍
      unknown.verify('hello') === 'hello';
      unknown.verify(false) === false;
      unknown.verify(undefined) === undefined;
      unknown.verify([1, 2]) === [1, 2];

      // 👎
      // This decoder will never reject an input
    """,
  },

  'array': {
    'section': 'Arrays',
    'params': [('decoder', 'Decoder<T>')],
    'return_type': 'Decoder<T[]>',
    'example': """
      const decoder = array(string);

      // 👍
      decoder.verify(['hello', 'world']) === ['hello', 'world'];
      decoder.verify([]) === [];

      // 👎
      decoder.verify(['hello', 1.2]);  // throws
    """,
  },

  'nonEmptyArray': {
    'section': 'Arrays',
    'params': [('decoder', 'Decoder<T>')],
    'return_type': 'Decoder<[T, ...T[]]>',
    'example': """
      const decoder = nonEmptyArray(string);

      // 👍
      decoder.verify(['hello', 'world']) === ['hello', 'world'];

      // 👎
      decoder.verify(['hello', 1.2]);  // throws
      decoder.verify([]);              // throws
    """,
  },

  'poja': {
    'section': 'Arrays',
    'params': None,
    'return_type': 'Decoder<unknown[]>',
    'example': """
      // 👍
      poja.verify([1, 'hi', true]) === [1, 'hi', true];
      poja.verify(['hello', 'world']) === ['hello', 'world'];
      poja.verify([]) === [];

      // 👎
      poja.verify({});    // throws
      poja.verify('hi');  // throws
    """,
  },

  'tuple': {
    'section': 'Arrays',
    'signatures': [
      {
        'type_params': ['A', 'B', '...'],
        'params': [(None, 'Decoder<A>'), (None, 'Decoder<B>'), (None, '...')],
        'return_type': 'Decoder<[A, B, ...]>',
      },
    ],
    'example': """
      const decoder = tuple(string, number);

      // 👍
      decoder.verify(['hello', 1.2]) === ['hello', 1.2];

      // 👎
      decoder.verify([]);                  // throws, too few items
      decoder.verify(['hello', 'world']);  // throws, not the right types
      decoder.verify(['a', 1, 'c']);       // throws, too many items
    """,
  },

  'object': {
    'section': 'Objects',
    'type_params': ['A','B', '...'],
    'params': [(None, '{ field1: Decoder<A>, field2: Decoder<B>, ... }')],
    'return_type': 'Decoder<{ field1: A, field2: B, ... }>',
    'example': """
      ```ts
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

      For more information, see also [The difference between ``object``, ``exact``, and ``inexact``](./tips.html#the-difference-between-object-exact-and-inexact).
    """,
  },

  'exact': {
    'section': 'Objects',
    'type_params': ['A','B', '...'],
    'params': [(None, '{ field1: Decoder<A>, field2: Decoder<B>, ... }')],
    'return_type': 'Decoder<{ field1: A, field2: B, ... }>',
    'example': """
      ```ts
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

      For more information, see also [The difference between ``object``, ``exact``, and ``inexact``](./tips.html#the-difference-between-object-exact-and-inexact).
    """,
  },

  'inexact': {
    'section': 'Objects',
    'type_params': ['A','B', '...'],
    'params': [(None, '{ field1: Decoder<A>, field2: Decoder<B>, ... }')],
    'return_type': 'Decoder<{ field1: A, field2: B, ... }>',
    'example': """
      ```ts
      const decoder = inexact({
        x: number,
        y: number,
      });

      // 👍
      decoder.verify({ x: 1, y: 2 }) === { x: 1, y: 2 };
      decoder.verify({ x: 1, y: 2, z: 3 }) === { x: 1, y: 2, z: 3 };

      // 👎
      decoder.verify({ x: 1 });  // throws, missing field `y`
      ```

      For more information, see also [The difference between ``object``, ``exact``, and ``inexact``](./tips.html#the-difference-between-object-exact-and-inexact).
    """,
  },

  'pojo': {
    'section': 'Objects',
    'params': None,
    'return_type': 'Decoder<Record<string, unknown>>',
    'example': """
      // 👍
      pojo.verify({}) === {};
      pojo.verify({ name: 'hi' }) === { name: 'hi' };

      // 👎
      pojo.verify('hi');        // throws
      pojo.verify([]);          // throws
      pojo.verify(new Date());  // throws
      pojo.verify(null);        // throws
    """,
  },


  'record': {
    'section': 'Collections',
    'signatures': [
      {
        'type_params': ['V'],
        'params': [('values', 'Decoder<V>')],
        'return_type': 'Decoder<Record<string, V>>',
        },
      {
        'type_params': ['K', 'V'],
        'params': [('keys', 'Decoder<K>'), ('values', 'Decoder<V>')],
        'return_type': 'Decoder<Record<K, V>>',}
      ],
    'example': """
      This is useful to validate inputs like `{ [key: string]: V }`.

      #### Decoding values only

      The default call takes a single argument and will validate all _values_.
      For example, to validate that all values in the object are numbers:

      ```ts
      const decoder = record(number);
      //                        \ 
      //                      Values must be numbers

      // 👍
      decoder.verify({ red: 1, blue: 2, green: 3 });

      // 👎
      decoder.verify({ hi: 'not a number' });
      ```

      #### Decoding keys and values

      If you also want to validate that keys are of a specific form, use the
      two-argument form: `record(key, value)`. Note that the given key decoder
      must return strings.

      For example, to enforce that all keys are emails:

      ```ts
      const decoder = record(email, number);
      //                      /        \ 
      //              Keys must        Values must
      //             be emails           be numbers

      // 👍
      decoder.verify({ "me@nvie.com": 1 });

      // 👎
      decoder.verify({ "no-email": 1 });
      ```
    """,
  },

  'dict': {
    'section': 'Collections',
    'signatures': [
      {
        'type_params': ['V'],
        'params': [('decoder', 'Decoder<T>')],
        'return_type': 'Decoder<Record<string, V>>',
      }
    ],
    'markdown': """
      Alias of `record()`.
    """,
  },

  'mapping': {
    'section': 'Collections',
    'type_params': ['T'],
    'params': [('decoder', 'Decoder<T>')],
    'return_type': 'Decoder<Map<string, T>>',
    'example': """
      const decoder = mapping(number);

      // 👍
      decoder.verify({ red: 1, blue: 2, green: 3 });
      // Map([
      //   ['red', '1'],
      //   ['blue', '2'],
      //   ['green', '3'],
      // ]);
    """,
  },

  'setFromArray': {
    'section': 'Collections',
    'type_params': ['T'],
    'params': [('decoder', 'Decoder<T>')],
    'return_type': 'Decoder<Set<T>>',
    'example': """
      const decoder = setFromArray(string);

      // 👍
      decoder.verify(['abc', 'pqr'])  // new Set(['abc', 'pqr'])
      decoder.verify([])              // new Set([])

      // 👎
      decoder.verify([1, 2]);         // throws, not the right types
    """,
  },

  'set': {
    'section': 'Collections',
    'type_params': ['T'],
    'params': [('decoder', 'Decoder<T>')],
    'return_type': 'Decoder<Set<T>>',
    'markdown': """
      An alias of `setFromArray()`.

      ⚠️ **IMPORTANT!** This decoder will change its behavior in a future
      version! If you rely on this decoder, use `setFromArray()` instead.
    """,
  },

  'json': {
    'section': 'JSON values',
    'params': None,
    'return_type': 'Decoder<JSONValue>',
    'example': """
      // 👍
      json.verify({
        name: 'Amir',
        age: 27,
        admin: true,
        image: null,
        tags: ['vip', 'staff'],
      });
    """,
  },

  'jsonObject': {
    'section': 'JSON values',
    'params': None,
    'return_type': 'Decoder<{ [string]: JSONValue }>',
    'example': """
      // 👍
      jsonObject.verify({});                // {}
      jsonObject.verify({ name: 'Amir' });  // { name: 'Amir' }

      // 👎
      jsonObject.verify([]);                   // throws
      jsonObject.verify([{ name: 'Alice' }]);  // throws
      jsonObject.verify('hello');              // throws
      jsonObject.verify(null);                 // throws
    """,
  },

  'jsonArray': {
    'section': 'JSON values',
    'params': None,
    'return_type': 'Decoder<JSONValue[]>',
    'example': """
      // 👍
      jsonArray.verify([]);                  // []
      jsonArray.verify([{ name: 'Amir' }]);  // [{ name: 'Amir' }]

      // 👎
      jsonArray.verify({});                 // throws
      jsonArray.verify({ name: 'Alice' });  // throws
      jsonArray.verify('hello');            // throws
      jsonArray.verify(null);               // throws
    """,
  },

  'either': {
    'section': 'Unions',
    'signatures': [
      {
        'type_params': ['A', 'B', '...'],
        'params': [(None, 'Decoder<A>'), (None, 'Decoder<B>'), (None, '...')],
        'return_type': 'Decoder<A | B | ...>',
      },
    ],
    'example': """
      const decoder = either(number, string);

      // 👍
      decoder.verify('hello world') === 'hello world';
      decoder.verify(123) === 123;

      // 👎
      decoder.verify(false);  // throws
    """,
  },

  'oneOf': {
    'section': 'Unions',
    'type_params': ['T'],
    'params': [
      ('values', 'T[]'),
    ],
    'return_type': 'Decoder<T>',
    'example': """
      ```ts
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

      ```ts
      oneOf(['foo', 'bar']);
      ```
    """,
  },

  'enum_': {
    'section': 'Unions',
    'signatures': [
      {
        'params': [('enum', 'MyEnum')],
        'return_type': 'Decoder<MyEnum>',
      },
    ],
    'example': """
      It works with numeric enums:

      ```ts
      enum Fruit {
        Apple,
        Banana,
        Cherry
      }

      const decoder = enum_(Fruit);

      // 👍
      decoder.verify(Fruit.Apple) === Fruit.Apple;
      decoder.verify(Fruit.Banana) === Fruit.Banana;
      decoder.verify(Fruit.Cherry) === Fruit.Cherry;
      decoder.verify(0) === Fruit.Apple;
      decoder.verify(1) === Fruit.Banana;
      decoder.verify(2) === Fruit.Cherry;

      // 👎
      decoder.verify('Apple');  // throws
      decoder.verify(-1);       // throws
      decoder.verify(3);        // throws
      ```

      As well as with string enums:

      ```ts
      enum Fruit {
        Apple = 'a',
        Banana = 'b',
        Cherry = 'c'
      }

      const decoder = enum_(Fruit);

      // 👍
      decoder.verify(Fruit.Apple) === Fruit.Apple;
      decoder.verify(Fruit.Banana) === Fruit.Banana;
      decoder.verify(Fruit.Cherry) === Fruit.Cherry;
      decoder.verify('a') === Fruit.Apple;
      decoder.verify('b') === Fruit.Banana;
      decoder.verify('c') === Fruit.Cherry;

      // 👎
      decoder.verify('Apple');  // throws
      decoder.verify(0);        // throws
      decoder.verify(1);        // throws
      decoder.verify(2);        // throws
      decoder.verify(3);        // throws
      ```
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
    # 'example': """
    # """,
  },

  'select': {
    'section': 'Unions',
    'type_params': ['T', 'A', 'B', '...'],
    'params': [
      ('scout', 'Decoder<T>'),
      ('selectFn', '(result: T) => Decoder<A> | Decoder<B> | ...'),
    ],
    'return_type': 'Decoder<A | B | ...>',
    'example': """
    ```ts
    const decoder = select(
      // First, validate/extract the minimal information to make a decision
      object({ version: optional(number) }),

      // Then select which decoder to run
      (obj) => {
        switch (obj.version) {
          case undefined: return v1Decoder; // Suppose v1 doesn't have a discriminating field
          case 2:         return v2Decoder;
          case 3:         return v3Decoder;
          default:        return never('Invalid version');
        }
      },
    );
    // Decoder<V1 | V2 | V3>
    ```
    """,
  },

  'define': {
    'section': 'Utilities',
    'type_params': ['T'],
    'params': [
      ('fn', '(blob: unknown, ok, err) => DecodeResult<T>'),
    ],
    'return_type': 'Decoder<T>',

    'example': """
      > _**NOTE:** This is the lowest-level API to define a new decoder, and therefore not recommended unless you have a very good reason for it. Most cases can be covered more elegantly by starting from an existing decoder and using `.transform()` or `.refine()` on them instead._

      ```ts
      // NOTE: Please do NOT implement an uppercase decoder like this! 😇
      const uppercase: Decoder<string> = define(
        (blob, ok, err) => {
          if (typeof blob === 'string') {
            // Accept the input
            return ok(blob.toUpperCase());
          } else {
            // Reject the input
            return err('I only accept strings as input');
          }
        }
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
    'example': """
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
    """,
  },

  'never': {
    'section': 'Utilities',
    'params': None,
    'return_type': 'Decoder<never>',
    'aliases': ['fail'],
    'example': """
      const decoder = object({
        a: string,
        b: optional(never('Key b has been removed')),
      });

      // 👍
      decoder.verify({ a: 'foo' });            // { a: 'foo' };
      decoder.verify({ a: 'foo', c: 'bar' });  // { a: 'foo' };

      // 👎
      decoder.verify({ a: 'foo', b: 'bar' });  // throws
    """,
  },

  'instanceOf': {
    'section': 'Utilities',
    'type_params': ['T'],
    'params': [
      ('klass', 'Klass<T>'),
    ],
    'return_type': 'Decoder<T>',
    'example': """
      const decoder = instanceOf(Error);

      // 👍
      const value = new Error('foo');
      decoder.verify(value) === value;

      // 👎
      decoder.verify('foo');  // throws
      decoder.verify(3);      // throws
    """,
  },

  'lazy': {
    'section': 'Utilities',
    'type_params': ['T'],
    'params': [
      ('decoderFn', '() => Decoder<T>'),
    ],
    'return_type': 'Decoder<T>',
    'example': """
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
    """,
  },
}

#
# These lists the methods, as configured in src/core/Decoder.ts.
#
DECODER_METHODS = {
  'verify': {
    'params': [('blob', 'mixed')],
    'return_type': 'T',
    'example': """
      <img alt="The .verify() method explained" src="./assets/schematic-verify.png" style="max-width: min(592px, 100%)" />

      For example, take this simple number decoder.

      ```ts
      // 👍
      number.verify(123);     // 123
      number.verify(3.1415);  // 3.1415

      // 👎
      number.verify('hello'); // throws
      // Decoding error:
      // "hello"
      // ^^^^^^^ Must be number
      ```
    """,
  },

  'value': {
    'params': [('blob', 'mixed')],
    'return_type': 'T | undefined',
    'example': """
      <img alt="The .value() method explained" src="./assets/schematic-value.png" style="max-width: min(592px, 100%)" />

      ```ts
      // 👍
      number.value(3);     // 3
      string.value('hi');  // 'hi'

      // 👎
      number.value('hi');  // undefined
      string.value(42);    // undefined
      ```

      > _**NOTE:** When you use this on `optional()` decoders, you cannot distinguish a rejected value from an accepted ``undefined`` input value._
    """,
  },

  'decode': {
    'params': [('blob', 'mixed')],
    'return_type': 'DecodeResult<T>',
    'example': """
      <img alt="The .decode() method explained" src="./assets/schematic-decode.png" style="max-width: min(592px, 100%)" />

      For example, take this simple "number" decoder. When given an number value, it will return an ok: true result. Otherwise, it will return an ok: false result with the original input value annotated.

      ```ts
      // 👍
      number.decode(3);     // { ok: true, value: 3 };

      // 👎
      number.decode('hi');  // { ok: false, error: { type: 'scalar', value: 'hi', text: 'Must be number' } }
      ```
    """,
  },

  'transform': {
    'type_params': ['V'],
    'params': [
        ('transformFn', '(T) => V'),
    ],
    'return_type': 'Decoder<V>',
    'example': """
      const upper = string.transform((s) => s.toUpperCase());

      // 👍
      upper.verify('foo') === 'FOO'

      // 👎
      upper.verify(4);  // throws
    """,
  },

  'refine': {
    'params': [
      ('predicate', 'T => boolean'),
      ('message', 'string'),
    ],
    'return_type': 'Decoder<T>',
    'example': """
      ```ts
      const odd = number.refine(
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

  'refineType': {
    'type_params': ['SubT extends T'],
    'params': [],
    'return_type': 'Decoder<SubT>',
    'example': """
      const user = object({ name: string }).refineType<Person>();
    """,
  },

  'reject': {
    'params': [
      ('rejectFn', 'T => string | null'),
    ],
    'return_type': 'Decoder<T>',
    'example': """
      const decoder = pojo
        .reject(
          obj => {
            const badKeys = Object.keys(obj).filter(key => key.startsWith('_'));
            return badKeys.length > 0
              ? `Disallowed keys: ${badKeys.join(', ')}`
              : null;
          }
        );

      // 👍
      decoder.verify({ id: 123, name: 'Vincent' }) === { id: 123, name: 'Vincent' };

      // 👎
      decoder.verify({ id: 123, _name: 'Vincent'  })   // throws: "Disallowed keys: _name"
    """,
  },

  'describe': {
    'params': [
        ('message', 'string'),
    ],
    'return_type': 'Decoder<T>',
    'markdown': """
      Uses the given decoder, but will use an alternative error message in case it rejects. This can be used to simplify or shorten otherwise long or low-level/technical errors.

      ```ts
      const vowel = oneOf(['a', 'e', 'i', 'o', 'u'])
        .describe('Must be vowel');
      ```
    """,
  },

  'then': {
    'signatures': [
      {
        'type_params': ['V'],
        'params': [
          ('next', '(blob: T, ok, err) => DecodeResult<V> | Decoder<V>'),
        ],
        'return_type': 'Decoder<V>',
      },
      {
        'type_params': ['V'],
        'params': [
          ('next', 'Decoder<V>'),
        ],
        'return_type': 'Decoder<V>',
        },
    ],
    # 'example': """
    # """,
  },

  'pipe': {
    'type_params': ['V'],

    'signatures': [
      {
        'type_params': ['V'],
        'params': [('next', 'Decoder<V>')],
        'return_type': 'Decoder<V>',
      },
      {
        'type_params': ['V'],
        'params': [
          ('next', '(blob: T) => Decoder<V>'),
        ],
        'return_type': 'Decoder<V>',
      },
    ],

    'markdown': """
    ```tsx
    const decoder =
      string
        .transform((s) => s.split(',').map(Number))
        .pipe(array(positiveInteger));

    // 👍
    decoder.verify('7') === [7];
    decoder.verify('1,2,3') === [1, 2, 3];

    // 👎
    decoder.verify('1,-3')  // -3 is not positive
    decoder.verify('🚀');   // not a number
    decoder.verify('3.14'); // not a whole number
    decoder.verify(123);    // not a string
    decoder.verify(true);   // not a string
    decoder.verify(null);   // not a string
    ```

    #### Dynamic decoder selection with ``.pipe()``

    With `.pipe()` you can also dynamically select another decoder, based on dynamic runtime value.

    ```tsx
    string
      .transform((s) => s.split(',').map(Number))
      .pipe((tup) =>
        tup.length === 2
          ? point2d
          : tup.length === 3
            ? point3d
            : never('Invalid coordinate'),
      );
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


def mine_source_code_data():
    locinfo1 = run_json("node bin/linenos-Decoder-class.js")
    locinfo2 = run_json("node bin/linenos-decoders.js")

    # Check the definitions against the found sources
    for method in DECODER_METHODS:
      if not any(loc['name'] == method for loc in locinfo1):
        raise Exception(f'Decoder method ".{method}()" not found in source code')

    for name in DECODERS:
      if not any(loc['name'] == name for loc in locinfo2):
        raise Exception(f'Decoder "{name}" not found in source code')

    locations = { }
    doc_strings = { }
    for info in locinfo1:
      locations[info['name']] = info['remote']
      doc_strings[info['name']] = info['comment']
    for info in locinfo2:
      locations[info['name']] = info['remote']
      doc_strings[info['name']] = info['comment']

    return (locations, doc_strings)


# Extract source line locations and doc strings directly from the source code
(LOCATIONS, DOC_STRINGS) = mine_source_code_data()


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
