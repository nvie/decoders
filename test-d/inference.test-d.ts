import type {
  Decoder,
  DecoderType,
  JSONValue,
  JSONObject,
  JSONArray,
  ReadonlyDecoder,
} from '../dist';
import {
  // Decoders
  always,
  anyNumber,
  array,
  bigint,
  boolean,
  constant,
  date,
  datelike,
  decimal,
  define,
  defineReadonly,
  dict,
  either,
  email,
  endsWith,
  enum_,
  exact,
  fail,
  hardcoded,
  hexadecimal,
  httpsUrl,
  inexact,
  instanceOf,
  integer,
  iso8601,
  json,
  jsonArray,
  jsonObject,
  lazy,
  mapping,
  maybe,
  mixed,
  nanoid,
  identifier,
  never,
  nonEmptyArray,
  nonEmptyString,
  nullable,
  nullish,
  null_,
  number,
  numeric,
  object,
  oneOf,
  optional,
  poja,
  pojo,
  positiveInteger,
  positiveNumber,
  prep,
  readonly,
  record,
  regex,
  select,
  set,
  setFromArray,
  startsWith,
  string,
  taggedUnion,
  truthy,
  tuple,
  undefined_,
  unknown,
  url,
  uuid,
  uuidv1,
  uuidv4,

  // Formatters
  formatInline,
  formatShort,
} from '../dist';
import { expectError, expectType, expectAssignable } from 'tsd';

// Helper function to "test" a decoder on some input, and assert the return type
function test<T>(decoder: Decoder<T>): T {
  return decoder.verify('dummy');
}

const strings = array(string);

function foo(
  _p: DecoderType<Decoder<string>>,
  _q: DecoderType<Decoder<number[]>>,
  _r: DecoderType<typeof strings>,
  _s: DecoderType<typeof truthy>,
) {}

expectType<123 | 'hi'>(
  test(
    define((blob, ok, err) => {
      expectType<unknown>(blob);
      return Math.random() < 0.5 ? ok(123) : Math.random() < 0.5 ? ok('hi') : err('fail');
    }),
  ),
);

expectType<number>(
  test(
    defineReadonly((blob): blob is number => {
      expectType<unknown>(blob);
      return Math.random() < 0.5;
    }, 'fail'),
  ),
);

expectType<(p: string, q: number[], r: string[], s: boolean) => void>(foo);

expectType<'foo'>(test(constant('foo')));
expectType<'foo'>(test(hardcoded('foo')));
expectType<Date>(test(hardcoded(() => new Date())));
expectType<'foo'>(test(always('foo')));
expectType<42>(test(always(42)));
expectType<Date>(test(always(() => new Date())));

expectType<null>(test(null_));
expectType<undefined>(test(undefined_));
expectType<unknown>(test(mixed));
expectType<unknown>(test(unknown));

expectType<number>(test(anyNumber));
expectType<number>(test(integer));
expectType<number>(test(number));
expectType<number>(test(positiveInteger));
expectType<number>(test(positiveNumber));
expectType<number>(test(numeric));
expectType<bigint>(test(bigint));

expectType<string>(test(string));
expectType<string>(test(nonEmptyString));
expectType<string>(test(decimal));
expectType<string>(test(hexadecimal));
expectType<string>(test(email));
expectType<string>(test(regex(/foo/, 'Must be foo')));
expectType<`foo-${string}`>(test(startsWith('foo-')));
expectType<`${string}-bar`>(test(endsWith('-bar')));
expectType<URL>(test(url));
expectType<URL>(test(httpsUrl));
expectType<string>(test(identifier));
expectType<string>(test(nanoid()));
expectType<string>(test(nanoid({ size: 7 })));
expectType<string>(test(nanoid({ min: 8 })));
expectType<string>(test(nanoid({ max: 16 })));
expectType<string>(test(nanoid({ min: 8, max: 16 })));
expectType<string>(test(uuid));
expectType<string>(test(uuidv1));
expectType<string>(test(uuidv4));

expectType<string[]>(test(array(string)));
expectType<number[]>(test(array(number)));
expectType<number[][]>(test(array(array(number))));
expectType<unknown[]>(test(poja));
expectType<[string, ...string[]]>(test(nonEmptyArray(string)));
expectType<[number, ...number[]]>(test(nonEmptyArray(number)));
expectType<Set<string>>(test(setFromArray(string)));
expectType<Set<number>>(test(setFromArray(number)));
expectType<Set<string>>(test(set(string)));
expectType<Set<number>>(test(set(number)));

expectType<[string]>(test(tuple(string)));
expectType<[string, number]>(test(tuple(string, number)));
expectType<[string, string, number]>(test(tuple(string, string, number)));
expectType<[string, string, number, string]>(test(tuple(string, string, number, string)));
expectType<[string, string, number, string, number]>(
  test(tuple(string, string, number, string, number)),
);
expectType<[string, string, number, string, number, string]>(
  test(tuple(string, string, number, string, number, string)),
);

expectType<{ name: string; tags: string[] }>(
  test(
    object({
      name: string,
      tags: array(string),
    }),
  ),
);

expectType<Record<string, never>>(test(object({})));

// Style argument
string.verify('dummy', formatInline);
string.verify('dummy', formatShort);

expectType<number | undefined>(number.value('dummy'));
expectType<string | undefined>(string.value('dummy'));

expectType<number>(test(string.then((value: string, ok) => ok(value.length))));
expectType<number>(
  test(
    string.then((value: string, ok, err) =>
      Math.random() < 0.5 ? ok(value.length) : err('Nope'),
    ),
  ),
);
expectType<number | string>(
  test(
    string.then((value: string, ok, err) =>
      Math.random() < 0.3
        ? ok(value.length)
        : Math.random() < 0.5
          ? ok(value)
          : err('Nope'),
    ),
  ),
);

// .then()
expectType<number>(test(string.transform(Number).then(positiveInteger)));
expectType<number>(test(string.transform(Number).then(positiveInteger.decode)));
expectType<boolean>(test(string.transform(Number).transform(String).then(truthy)));
expectType<boolean>(test(string.transform(Number).transform(String).then(truthy.decode)));

// .pipe()
expectType<number>(test(string.transform(Number).pipe(positiveInteger)));
expectType<boolean>(test(string.transform(Number).transform(String).pipe(truthy)));
// .pipe() with branch infers decoder from both branches
expectType<number | string>(
  test(string.transform(Number).pipe(Math.random() < 0.5 ? positiveInteger : string)),
);
// .pipe() with function with branches infers decoder from both branches
expectType<number | string>(
  test(
    string.transform(Number).pipe(() => (Math.random() < 0.5 ? positiveInteger : string)),
  ),
);
// .pipe() with input function with branches infers decoder from both branches
expectType<number | string>(
  test(string.transform(Number).pipe((x) => (x < 0.5 ? positiveInteger : string))),
);

expectType<string>(test(string.refine((s) => s.startsWith('x'), 'Must start with x')));

expectType<string>(
  test(unknown.refine((foo): foo is string => typeof foo === 'string', 'Is string')),
);

expectType<'a' | 'b'>(
  test(
    string.refine(
      (foo: string): foo is 'a' | 'b' => foo === 'a' || foo === 'b',
      'Is a or b',
    ),
  ),
);

expectType<number[]>(
  test(
    array(number).reject((numbers) =>
      numbers.reduce((acc, n) => acc + n) > 0
        ? `Sum of ${numbers.join(' + ')} must be positive`
        : null,
    ),
  ),
);

expectType<string>(test(string.describe('xxx')));
expectType<number>(test(number.describe('xxx')));

expectType<string>(test(prep(Number, string)));
expectType<string>(test(prep(String, string)));
expectType<number>(test(prep(Number, number)));
expectType<number>(test(prep(String, number)));
expectType<string | number>(test(prep(String, either(number, string))));

expectType<string | number>(test(prep(Number, either(number, string))));

// Ensure regression from https://github.com/nvie/decoders/issues/941 doesn't play up again
expectType<{ a: string; b: string; c: string } | { a: string }>(
  test(either(object({ a: string, b: string, c: string }), object({ a: string }))),
);

expectType<string[]>(test(array(string)));
expectType<number[]>(test(array(number)));
expectType<number[][]>(test(array(array(number))));
expectType<unknown[]>(test(poja));

expectType<boolean>(test(boolean));
expectType<boolean>(test(truthy));

expectType<string | undefined>(test(optional(string)));
expectType<string | undefined>(test(optional(optional(string))));
expectType<string | 42>(test(optional(string, 42)));
expectType<string | 42>(test(optional(optional(string), 42)));
expectType<string | 42 | undefined>(test(optional(optional(string, 42))));
expectType<string | Date>(test(optional(string, () => new Date())));
expectType<string | Date>(test(optional(optional(string), () => new Date())));
expectType<string | Date | undefined>(test(optional(optional(string, () => new Date()))));

expectType<string | null>(test(nullable(string)));
expectType<string | null>(test(nullable(nullable(string))));
expectType<string | 42>(test(nullable(string, 42)));
expectType<string | 42>(test(nullable(nullable(string), 42)));
expectType<string | 42 | null>(test(nullable(nullable(string, 42))));
expectType<string | Date>(test(nullable(string, () => new Date())));
expectType<string | Date>(test(nullable(nullable(string), () => new Date())));
expectType<string | Date | null>(test(nullable(nullable(string, () => new Date()))));

expectType<string | null | undefined>(test(nullish(string)));
expectType<string | null | undefined>(test(nullish(nullish(string))));
expectType<string | 42>(test(nullish(string, 42)));
expectType<string | 42>(test(nullish(nullish(string), 42)));
expectType<string | 42 | null | undefined>(test(nullish(nullish(string, 42))));
expectType<string | Date>(test(nullish(string, () => new Date())));
expectType<string | Date>(test(nullish(nullish(string), () => new Date())));
expectType<string | Date | null | undefined>(
  test(nullish(nullish(string, () => new Date()))),
);

// Alias of `nullish()`
expectType<string | null | undefined>(test(maybe(string)));
expectType<string | null | undefined>(test(maybe(maybe(string))));
expectType<string | 42>(test(maybe(string, 42)));
expectType<string | 42>(test(maybe(maybe(string), 42)));
expectType<string | 42 | null | undefined>(test(maybe(maybe(string, 42))));
expectType<string | Date>(test(maybe(string, () => new Date())));
expectType<string | Date>(test(maybe(maybe(string), () => new Date())));
expectType<string | Date | null | undefined>(
  test(maybe(maybe(string, () => new Date()))),
);

// object()
{
  const d = object({
    foo: optional(string),
    fooOrNull1: optional(nullable(string)),
    fooOrNull2: nullable(optional(string)),
    bar: object({ baz: string }),
    qux: never('No way, Jose'),
    quxx: optional(never('No way, Jose')),
  });

  expectType<{
    foo?: string;
    fooOrNull1?: string | null;
    fooOrNull2?: string | null;
    bar: { baz: string };
    qux: never;
    quxx?: never;
  }>(test(d));
  const x = test(d);
  expectType<string | undefined>(x.foo);
  expectType<string | null | undefined>(x.fooOrNull1);
  expectType<string | null | undefined>(x.fooOrNull2);
  expectType<{ baz: string }>(x.bar);
  expectError(x.a);
  expectError(x.b);
  expectType<never>(x.qux);
  expectType<undefined>(x.quxx);

  // With "unknown" fields (which implicitly contain "undefined")
  expectType<{ a?: unknown }>(test(object({ a: unknown })));

  // With "never" fields
  expectType<{ nope: never }>(test(object({ nope: fail('not allowed') })));
  expectType<{ nope?: never }>(test(object({ nope: optional(fail('not allowed')) })));
}

// exact() (w/ empty mapping)
expectType<Record<string, never>>(test(object({})));
expectType<never>(test(object({})).a);
expectType<never>(test(object({})).b);

// exact()
{
  const d = exact({
    foo: optional(string),
    bar: object({ qux: string }),
  });

  expectType<{ bar: { qux: string }; foo?: string }>(test(d));
  const x = test(d);
  expectType<string | undefined>(x.foo);
  expectType<{ qux: string }>(x.bar);
  expectError(x.a);
  expectError(x.b);
}

// exact() (w/ empty mapping)
expectType<Record<string, never>>(test(exact({})));
expectType<never>(test(exact({})).a);
expectType<never>(test(exact({})).b);

// inexact()
expectType<{ id: number } & Record<string, unknown>>(test(inexact({ id: number })));
expectType<number>(test(inexact({ id: number })).id);
expectType<unknown>(test(inexact({ id: number })).a);
expectType<unknown>(test(inexact({ id: number })).b);

// inexact() (w/ empty mapping)
expectType<Record<string, unknown>>(test(inexact({})));
expectType<unknown>(test(inexact({})).a);
expectType<unknown>(test(inexact({})).b);

expectType<Record<string, unknown>>(test(pojo));
expectType<Map<string, number>>(test(mapping(number)));

// Single-argument form (validate values only)
expectType<Record<string, number>>(test(record(number)));

// Two-argument form (validate keys and values)
expectType<Record<'foo' | 'bar', number>>(
  test(record(oneOf(['foo', 'bar'] as const), number)),
);
expectType<Record<string, number>>(test(record(decimal, number)));
expectType<Record<string, boolean>>(test(record(email, boolean)));

// Single-argument form (validate values only)
expectType<Record<string, number>>(test(dict(number)));

// Two-argument form (validate keys and values)
expectType<Record<'foo' | 'bar', number>>(
  test(dict(oneOf(['foo', 'bar'] as const), number)),
);
expectType<Record<string, number>>(test(dict(decimal, number)));
expectType<Record<string, boolean>>(test(dict(email, boolean)));

expectType<string>(test(lazy(() => string)));
expectType<number>(test(lazy(() => number)));

expectType<JSONValue>(test(json));
expectType<JSONObject>(test(jsonObject));
expectType<JSONArray>(test(jsonArray));
expectType<JSONValue | undefined>(test(jsonObject).abc);

{
  interface Animal {
    name: string;
  }
  class Cat implements Animal {
    name = 'cat';
  }
  class Dog implements Animal {
    name = 'dog';
  }
  class Labrador extends Dog {
    name = 'labrador';
  }

  expectType<Labrador>(test(instanceOf(Labrador)));
  expectType<Dog>(test(instanceOf(Dog)));
  expectType<Cat>(test(instanceOf(Cat)));

  // Or use it on existing types
  expectType<Error>(test(instanceOf(Error)));
  expectType<RegExp>(test(instanceOf(RegExp)));

  // Weird case... due to the way the TypeError constructor is defined in the
  // standard library, this doesn't work for TypeError...
  // expectType<TypeError>(test(instanceOf(TypeError)));

  // Parameterized classes cannot be inferred automatically...
  expectType<Promise<unknown>>(test(instanceOf(Promise)));
  expectType<Set<unknown>>(test(instanceOf(Set)));
  expectType<Map<unknown, unknown>>(test(instanceOf(Map)));
}

expectType<Date>(test(date));
expectType<Date>(test(iso8601));
expectType<Date>(test(datelike));

expectType<never>(test(fail('I will never return')));
expectType<never>(test(never('I will never return')));

expectType<string | number>(test(either(string, number)));
expectType<string | number>(test(either(string, string, number)));
expectType<string | number | boolean | number[]>(
  test(either(string, boolean, number, array(number))),
);
expectType<string>(test(either(string, string, string, string, string)));
expectType<string>(test(either(string, string, string, string, string, string)));
expectType<string>(test(either(string, string, string, string, string, string, string)));
expectType<string>(
  test(either(string, string, string, string, string, string, string, string)),
);
expectType<string>(
  test(either(string, string, string, string, string, string, string, string, string)),
);

expectType<'foo' | 'bar'>(test(oneOf(['foo', 'bar'])));

enum Fruit {
  Apple = 'a',
  Banana = 'b',
  Cherry = 'c',
}

enum Primes {
  Five = 5,
  Three = 3,
  Eleven = 11,
}

// Not sure why this isn't strictly expectType?
// TypeScript thinks these aren't equal types.
expectAssignable<Fruit>(test(enum_(Fruit)));
expectAssignable<Primes>(test(enum_(Primes)));

const ConstEnum = {
  Five: 'five',
  Three: 3,
  Nine: 9,
} as const;

type MixedConstEnumType = (typeof ConstEnum)[keyof typeof ConstEnum];

expectType<MixedConstEnumType>(test(enum_(ConstEnum)));

interface Rect {
  _type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Circle {
  _type: 'circle';
  cx: number;
  cy: number;
  radius: number;
}

type Shape = Rect | Circle;

const rect: Decoder<Rect> = object({
  _type: constant('rect'),
  x: number,
  y: number,
  width: number,
  height: number,
});

const circle: Decoder<Circle> = object({
  _type: constant('circle'),
  cx: number,
  cy: number,
  radius: number,
});

expectType<Shape>(test(taggedUnion('_type', { rect, circle })));

expectType<Shape>(test(select(unknown, (_) => (Math.random() < 0.5 ? rect : circle))));

{
  function takesShape(_d: Decoder<Shape>) {}

  // Works
  takesShape(
    taggedUnion('_type', {
      rect,
      circle,
    }),
  );

  // Should fail
  expectError(
    takesShape(
      taggedUnion('_type', {
        new: object({ _type: constant('new') }),
        rect,
        circle,
      }),
    ),
  );
}

interface Rect1 {
  _type: 0;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Circle1 {
  _type: 1;
  cx: number;
  cy: number;
  radius: number;
}

type Shape1 = Rect1 | Circle1;

const rect1: Decoder<Rect1> = object({
  _type: constant(0),
  x: number,
  y: number,
  width: number,
  height: number,
});

const circle1: Decoder<Circle1> = object({
  _type: constant(1),
  cx: number,
  cy: number,
  radius: number,
});

expectType<Shape1>(test(taggedUnion('_type', { 0: rect1, 1: circle1 })));

// Branded types
type UppercaseString = string & { __brand: 'UppercaseString' };

// Refining types can be done, but only to narrower types
expectType<string>(test(string.refineType()));
expectType<UppercaseString>(test(string.refineType<UppercaseString>()));
expectType<'foo' | 'bar'>(test(string.refineType<'foo' | 'bar'>()));

// Refining types to wider types is not allowed
// XXX Ideally these should error! :( Look into the .refine() overload in the ReadonlyDecoder.
// expectError(test(string.refineType<string | 42>()));
// expectError(test(string.refineType<'foo' | 'bar' | 42>()));
// expectError(test(string.refineType<unknown>()));

// Readonly version that accepts only uppercase
expectType<ReadonlyDecoder<UppercaseString>>(
  regex(/^[A-Z]+$/, 'Must be uppercase').refineType<UppercaseString>(),
);

// readonly() helper
expectType<ReadonlyDecoder<string>>(string);
expectType<ReadonlyDecoder<string>>(readonly(string));
expectType<ReadonlyDecoder<string>>(readonly(readonly(string)));
expectType<ReadonlyDecoder<string[]>>(readonly(array(string)));
