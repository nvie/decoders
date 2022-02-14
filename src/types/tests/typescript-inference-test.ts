import {
    always,
    anyNumber,
    array,
    boolean,
    constant,
    date,
    Decoder,
    DecoderType,
    define,
    dict,
    either,
    email,
    exact,
    fail,
    hardcoded,
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
    never,
    nonEmptyArray,
    nonEmptyString,
    nullable,
    null_,
    number,
    numericBoolean,
    object,
    oneOf,
    optional,
    poja,
    pojo,
    positiveInteger,
    positiveNumber,
    prep,
    regex,
    set,
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
} from 'decoders';
import { formatInline, formatShort } from 'decoders/format';
import { ok } from 'decoders/result';

// Helper function to "test" a decoder on some input, and assert the return type
function test<T>(decoder: Decoder<T>): T {
    return decoder.verify('dummy');
}

const strings = array(string);

// $ExpectType (p: string, q: number[], r: string[], s: boolean) => void
function foo(
    p: DecoderType<Decoder<string>>,
    q: DecoderType<Decoder<number[]>>,
    r: DecoderType<typeof strings>,
    s: DecoderType<typeof truthy>,
) {}

test(constant('foo')); // $ExpectType "foo"
test(hardcoded('foo')); // $ExpectType "foo"
test(hardcoded(() => new Date())); // $ExpectType Date
test(always('foo')); // $ExpectType "foo"
test(always(42)); // $ExpectType 42
test(always(() => new Date())); // $ExpectType Date

test(null_); // $ExpectType null
test(undefined_); // $ExpectType undefined
test(mixed); // $ExpectType unknown
test(unknown); // $ExpectType unknown

test(anyNumber); // $ExpectType number
test(integer); // $ExpectType number
test(number); // $ExpectType number
test(positiveInteger); // $ExpectType number
test(positiveNumber); // $ExpectType number

test(string); // $ExpectType string
test(nonEmptyString); // $ExpectType string
test(email); // $ExpectType string
test(regex(/foo/, 'Must be foo')); // $ExpectType string
test(url); // $ExpectType URL
test(httpsUrl); // $ExpectType URL
test(uuid); // $ExpectType string
test(uuidv1); // $ExpectType string
test(uuidv4); // $ExpectType string

test(array(string)); // $ExpectType string[]
test(array(number)); // $ExpectType number[]
test(array(array(number))); // $ExpectType number[][]
test(poja); // $ExpectType unknown[]
test(nonEmptyArray(string)); // $ExpectType [string, ...string[]]
test(nonEmptyArray(number)); // $ExpectType [number, ...number[]]
test(set(string)); // $ExpectType Set<string>
test(set(number)); // $ExpectType Set<number>

test(tuple(string)); // $ExpectType [string]
test(tuple(string, number)); // $ExpectType [string, number]
test(tuple(string, string, number)); // $ExpectType [string, string, number]
test(tuple(string, string, number, string)); // $ExpectType [string, string, number, string]
test(tuple(string, string, number, string, number)); // $ExpectType [string, string, number, string, number]
test(tuple(string, string, number, string, number, string)); // $ExpectType [string, string, number, string, number, string]

// $ExpectType { name: string; tags: string[]; }
test(
    object({
        name: string,
        tags: array(string),
    }),
);

// $ExpectType Record<string, never>
test(object({}));

// Style argument
string.verify('dummy', formatInline);
string.verify('dummy', formatShort);

number.value('dummy'); // $ExpectType number | undefined
string.value('dummy'); // $ExpectType string | undefined

// $ExpectType number
test(string.then((value: string) => ok(value.length)));

// $ExpectType number
test(string.peek_UNSTABLE(([blob, value]) => ok(value.length)));

// $ExpectType string
test(string.refine((s) => s.startsWith('x'), 'Must start with x'));

// $ExpectType string
test(unknown.refine((foo): foo is string => typeof foo === 'string', 'Is string'));

// $ExpectType "a" | "b"
test(
    string.refine(
        (foo: string): foo is 'a' | 'b' => foo === 'a' || foo === 'b',
        'Is a or b',
    ),
);

// $ExpectType number[]
test(
    array(number).reject((numbers) =>
        numbers.reduce((acc, n) => acc + n) > 0
            ? `Sum of ${numbers.join(' + ')} must be positive`
            : null,
    ),
);

// $ExpectType string
test(string.describe('xxx'));
// $ExpectType number
test(number.describe('xxx'));

test(prep(Number, string)); // $ExpectType string
test(prep(String, string)); // $ExpectType string
test(prep(Number, number)); // $ExpectType number
test(prep(String, number)); // $ExpectType number
test(prep(String, either(number, string))); // $ExpectType string | number
test(prep(Number, either(number, string))); // $ExpectType string | number

test(array(string)); // $ExpectType string[]
test(array(number)); // $ExpectType number[]
test(array(array(number))); // $ExpectType number[][]
test(poja); // $ExpectType unknown[]

test(boolean); // $ExpectType boolean
test(truthy); // $ExpectType boolean
test(numericBoolean); // $ExpectType boolean

test(optional(string)); // $ExpectType string | undefined
test(optional(optional(string))); // $ExpectType string | undefined
test(optional(string, 42)); // $ExpectType string | 42
test(optional(optional(string), 42)); // $ExpectType string | 42
test(optional(optional(string, 42))); // $ExpectType string | 42 | undefined
test(optional(string, () => new Date())); // $ExpectType string | Date
test(optional(optional(string), () => new Date())); // $ExpectType string | Date
test(optional(optional(string, () => new Date()))); // $ExpectType string | Date | undefined

test(nullable(string)); // $ExpectType string | null
test(nullable(nullable(string))); // $ExpectType string | null
test(nullable(string, 42)); // $ExpectType string | 42
test(nullable(nullable(string), 42)); // $ExpectType string | 42
test(nullable(nullable(string, 42))); // $ExpectType string | 42 | null
test(nullable(string, () => new Date())); // $ExpectType string | Date
test(nullable(nullable(string), () => new Date())); // $ExpectType string | Date
test(nullable(nullable(string, () => new Date()))); // $ExpectType string | Date | null

test(maybe(string)); // $ExpectType string | null | undefined
test(maybe(maybe(string))); // $ExpectType string | null | undefined
test(maybe(string, 42)); // $ExpectType string | 42
test(maybe(maybe(string), 42)); // $ExpectType string | 42
test(maybe(maybe(string, 42))); // $ExpectType string | 42 | null | undefined
test(maybe(string, () => new Date())); // $ExpectType string | Date
test(maybe(maybe(string), () => new Date())); // $ExpectType string | Date
test(maybe(maybe(string, () => new Date()))); // $ExpectType string | Date | null | undefined

// object()
{
    const d = object({
        foo: optional(string),
        bar: object({ qux: string }),
    });

    // $ExpectType { bar: { qux: string; }; foo?: string | undefined; }
    const x = test(d);
    x.foo; // $ExpectType string | undefined
    x.bar; // $ExpectType { qux: string; }
    x.a; // $ExpectError
    x.b; // $ExpectError
}

// exact() (w/ empty mapping)
test(object({})); // $ExpectType Record<string, never>
test(object({})).a; // $ExpectType never
test(object({})).b; // $ExpectType never

// exact()
{
    const d = exact({
        foo: optional(string),
        bar: object({ qux: string }),
    });

    // $ExpectType { bar: { qux: string; }; foo?: string | undefined; }
    const x = test(d);
    x.foo; // $ExpectType string | undefined
    x.bar; // $ExpectType { qux: string; }
    x.a; // $ExpectError
    x.b; // $ExpectError
}

// exact() (w/ empty mapping)
test(exact({})); // $ExpectType Record<string, never>
test(exact({})).a; // $ExpectType never
test(exact({})).b; // $ExpectType never

// inexact()
test(inexact({ id: number })); // $ExpectType { id: number; } & Record<string, unknown>
test(inexact({ id: number })).id; // $ExpectType number
test(inexact({ id: number })).a; // $ExpectType unknown
test(inexact({ id: number })).b; // $ExpectType unknown

// inexact() (w/ empty mapping)
test(inexact({})); // $ExpectType Record<string, unknown>
test(inexact({})).a; // $ExpectType unknown
test(inexact({})).b; // $ExpectType unknown

test(pojo); // $ExpectType Record<string, unknown>
test(mapping(number)); // $ExpectType Map<string, number>
test(dict(number)); // $ExpectType Record<string, number>

test(lazy(() => string)); // $ExpectType string
test(lazy(() => number)); // $ExpectType number

test(json); // $ExpectType JSONValue
test(jsonObject); // $ExpectType JSONObject
test(jsonArray); // $ExpectType JSONArray

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

    test(instanceOf(Labrador)); // $ExpectType Labrador
    test(instanceOf(Dog)); // $ExpectType Dog
    test(instanceOf(Cat)); // $ExpectType Cat

    // Or use it on existing types
    test(instanceOf(Error)); // $ExpectType Error
    test(instanceOf(RegExp)); // $ExpectType RegExp

    // Weird case... due to the way the TypeError constructor is defined in the
    // standard library, this doesn't work for TypeError...
    // test(instanceOf(TypeError)); // $ExpectType TypeError

    // Parameterized classes cannot be inferred automatically...
    test(instanceOf(Promise)); // $ExpectType Promise<unknown>
    test(instanceOf(Set)); // $ExpectType Set<unknown>
    test(instanceOf(Map)); // $ExpectType Map<unknown, unknown>
}

test(date); // $ExpectType Date

{
    // $ExpectType Date
    const d = test(iso8601);
    d.getFullYear();
}

test(fail('I will never return')); // $ExpectType never
test(never('I will never return')); // $ExpectType never

test(either(string, number)); // $ExpectType string | number
test(either(string, string, number)); // $ExpectType string | number
test(either(string, boolean, number, array(number))); // $ExpectType string | number | boolean | number[]
test(either(string, string, string, string, string)); // $ExpectType string
test(either(string, string, string, string, string, string)); // $ExpectType string
test(either(string, string, string, string, string, string, string)); // $ExpectType string
test(either(string, string, string, string, string, string, string, string)); // $ExpectType string
test(either(string, string, string, string, string, string, string, string, string)); // $ExpectType string

// $ExpectType "foo" | "bar"
test(oneOf(['foo', 'bar']));

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

// $ExpectType Values<{ rect: Rect; circle: Circle; }>
test(taggedUnion('_type', { rect, circle }));

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

// $ExpectType Values<{ 0: Rect1; 1: Circle1; }>
test(taggedUnion('_type', { 0: rect1, 1: circle1 }));
