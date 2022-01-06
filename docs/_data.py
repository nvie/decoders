#
# This file is the source from which all the Decoders documentation will get
# generated.
#
import json
import subprocess

#
# These lists the methods, as configured in src/_decoder.js.
#
DECODER_METHODS = {
  'verify': {
    'params': [['blob', 'mixed']],
    'result': 'T',
    'markdown': """
      Verified the (raw/untrusted/unknown) input and either accepts or rejects it.  When accepted, returns the decoded `T` value directly. Otherwise fail with a runtime error.

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
    'params': [['blob', 'mixed']],
    'result': 'DecodeResult<T>',
    'markdown': """
      Validates the raw/untrusted/unknown input and either accepts or rejects it.

      Contrasted with [**.verify**()](#verify), calls to **.decode**() will never fail and instead return a result type.

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
      ['predicate', 'T => boolean'],
      ['message', 'string'],
    ],
    'result': 'Decoder<T>',
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
      ['nextDecodeFn', 'T => DecodeResult<V>'],
    ],
    'result': 'Decoder<V>',
    'markdown': """
      Chain together the current decoder with the given decode function. The given function will only get called after the current decoder accepts an input.

      The given "next" decoding function will thus be able to make more assumptions about its input value, i.e. it can know what type the input value is (`T` instead of `unknown`).

      This is an advanced decoder, typically only useful for authors of decoders. It's not recommended to rely on this decoder directly for normal usage.  In most cases, [**.transform**()](#transform) is what you'll want instead.
    """,
  },

  'transform': {
    'type_params': ['V'],
    'params': [
        ['transformFn', '(T) => V'],
    ],
    'result': 'Decoder<V>',
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
        ['message', 'string'],
    ],
    'result': 'Decoder<T>',
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


def enrich_locations():
    raw = subprocess.run(
        [
            "linenos",
            "src/_decoder.js",
            "--remote-url",
            "--object-methods",
            "--json",
        ],
        capture_output=True,
    ).stdout
    locinfo = json.loads(raw)

    for name in DECODER_METHODS:
        entry = find(locinfo, lambda x: x['name'] == name)
        if entry:
            DECODER_METHODS[name]['source'] = entry['remote']
        else:
            raise Exception('No such decoder method: ' + name)


enrich_locations()
