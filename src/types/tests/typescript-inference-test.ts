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

const strings = array(string);

// $ExpectType (p: string, q: number[], r: string[], s: boolean) => void
function foo(
    p: DecoderType<Decoder<string>>,
    q: DecoderType<Decoder<number[]>>,
    r: DecoderType<typeof strings>,
    s: DecoderType<typeof truthy>,
) {}

constant('foo'); // $ExpectType Decoder<"foo">
hardcoded('foo'); // $ExpectType Decoder<"foo">
always('foo'); // $ExpectType Decoder<"foo">
always(42); // $ExpectType Decoder<42>

null_; // $ExpectType Decoder<null>
undefined_; // $ExpectType Decoder<undefined>
mixed; // $ExpectType Decoder<unknown>
unknown; // $ExpectType Decoder<unknown>

anyNumber; // $ExpectType Decoder<number>
integer; // $ExpectType Decoder<number>
number; // $ExpectType Decoder<number>
positiveInteger; // $ExpectType Decoder<number>
positiveNumber; // $ExpectType Decoder<number>

string; // $ExpectType Decoder<string>
nonEmptyString; // $ExpectType Decoder<string>
email; // $ExpectType Decoder<string>
regex(/foo/, 'Must be foo'); // $ExpectType Decoder<string>
url; // $ExpectType Decoder<URL>
httpsUrl; // $ExpectType Decoder<URL>
uuid; // $ExpectType Decoder<string>
uuidv1; // $ExpectType Decoder<string>
uuidv4; // $ExpectType Decoder<string>

array(string); // $ExpectType Decoder<string[]>
array(number); // $ExpectType Decoder<number[]>
array(array(number)); // $ExpectType Decoder<number[][]>
poja; // $ExpectType Decoder<unknown[]>
nonEmptyArray(string); // $ExpectType Decoder<[string, ...string[]]>
nonEmptyArray(number); // $ExpectType Decoder<[number, ...number[]]>
set(string); // $ExpectType Decoder<Set<string>>
set(number); // $ExpectType Decoder<Set<number>>

tuple(string); // $ExpectType Decoder<[string]>
tuple(string, number); // $ExpectType Decoder<[string, number]>
tuple(string, string, number); // $ExpectType Decoder<[string, string, number]>
tuple(string, string, number, string); // $ExpectType Decoder<[string, string, number, string]>
tuple(string, string, number, string, number); // $ExpectType Decoder<[string, string, number, string, number]>
tuple(string, string, number, string, number, string); // $ExpectType Decoder<[string, string, number, string, number, string]>

// $ExpectType { name: string; tags: string[]; }
object({
    name: string,
    tags: array(string),
}).verify('dummy');

// Style argument
string.verify('dummy', formatInline);
string.verify('dummy', formatShort);

// $ExpectType Decoder<number>
string.then((value: string) => ok(value.length));

// $ExpectType Decoder<number>
string.peek(([blob, value]) => ok(value.length));

// $ExpectType Decoder<string>
string.refine((s) => s.startsWith('x'), 'Must start with x');

// $ExpectType Decoder<string>
unknown.refine((foo): foo is string => typeof foo === 'string', 'Is string');

// $ExpectType Decoder<"a" | "b">
string.refine((foo: string): foo is 'a' | 'b' => foo === 'a' || foo === 'b', 'Is a or b');

prep(Number, string); // $ExpectType Decoder<string>
prep(String, string); // $ExpectType Decoder<string>
prep(Number, number); // $ExpectType Decoder<number>
prep(String, number); // $ExpectType Decoder<number>
prep(String, either(number, string)); // $ExpectType Decoder<string | number>
prep(Number, either(number, string)); // $ExpectType Decoder<string | number>

array(string); // $ExpectType Decoder<string[]>
array(number); // $ExpectType Decoder<number[]>
array(array(number)); // $ExpectType Decoder<number[][]>
poja; // $ExpectType Decoder<unknown[]>

boolean.verify('dummy'); // $ExpectType boolean
truthy.verify('dummy'); // $ExpectType boolean
numericBoolean.verify('dummy'); // $ExpectType boolean

optional(string); // $ExpectType Decoder<string | undefined>
optional(optional(string)); // $ExpectType Decoder<string | undefined>

nullable(string); // $ExpectType Decoder<string | null>
nullable(nullable(string)); // $ExpectType Decoder<string | null>

maybe(string); // $ExpectType Decoder<string | null | undefined>
maybe(maybe(string)); // $ExpectType Decoder<string | null | undefined>

// $ExpectType Decoder<{ bar: { qux: string; }; foo?: string | undefined; }>
object({
    foo: optional(string),
    bar: object({ qux: string }),
});

// $ExpectType Decoder<{ bar: { qux: string; }; foo?: string | undefined; }>
exact({
    foo: optional(string),
    bar: object({ qux: string }),
});

// $ExpectType Decoder<{ id: string; } & { [extra: string]: unknown; }>
inexact({ id: string });

// $ExpectType Decoder<{ [key: string]: unknown; }>
pojo;

// $ExpectType Decoder<Map<string, number>>
mapping(number);

// $ExpectType Decoder<{ [key: string]: number; }>
dict(number);

// $ExpectType Decoder<string>
lazy(() => string);

// $ExpectType Decoder<number>
lazy(() => number);

// $ExpectType JSONValue
json.verify('hi');

// $ExpectType JSONObject
jsonObject.verify({});

// $ExpectType JSONArray
jsonArray.verify([]);

// $ExpectType Decoder<Error>
instanceOf(Error);

// $ ExpectType Decoder<TypeError>
instanceOf(TypeError);

// $ExpectType Decoder<RegExp>
instanceOf(RegExp);

// $ExpectType Decoder<Promise<string>>
instanceOf<Promise<string>>(Promise);

// $ExpectError
instanceOf<Promise<string>>(Set);

// $ExpectType Decoder<Date>
date;

// $ExpectType Date
const d = iso8601.verify('dummy');
d.getFullYear();

fail('I will never return'); // $ExpectType Decoder<never>
never('I will never return'); // $ExpectType Decoder<never>

either(string, number); // $ExpectType Decoder<string | number>
either(string, string, number); // $ExpectType Decoder<string | number>
either(string, boolean, number, array(number)); // $ExpectType Decoder<string | number | boolean | number[]>
either(string, string, string, string, string); // $ExpectType Decoder<string>
either(string, string, string, string, string, string); // $ExpectType Decoder<string>
either(string, string, string, string, string, string, string); // $ExpectType Decoder<string>
either(string, string, string, string, string, string, string, string); // $ExpectType Decoder<string>
either(string, string, string, string, string, string, string, string, string); // $ExpectType Decoder<string>

// $ExpectType Decoder<"foo" | "bar" | "qux">
oneOf(['foo', 'bar', 'qux']);

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

// $ExpectType Decoder<Values<{ rect: Rect; circle: Circle; }>>
taggedUnion('_type', { rect, circle });

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

// $ExpectType Decoder<Values<{ 0: Rect1; 1: Circle1; }>>
taggedUnion('_type', { 0: rect1, 1: circle1 });

// $ExpectType Decoder<string>
string.describe('xxx');
// $ExpectType Decoder<number>
number.describe('xxx');
