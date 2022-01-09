import {
    always,
    array,
    boolean,
    compose,
    constant,
    date,
    Decoder,
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
    predicate,
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

constant('foo'); // $ExpectType Decoder<"foo", unknown>
hardcoded('foo'); // $ExpectType Decoder<"foo", unknown>
always('foo'); // $ExpectType Decoder<"foo", unknown>
always(42); // $ExpectType Decoder<42, unknown>

null_; // $ExpectType Decoder<null, unknown>
undefined_; // $ExpectType Decoder<undefined, unknown>
mixed; // $ExpectType Decoder<unknown, unknown>
unknown; // $ExpectType Decoder<unknown, unknown>

integer; // $ExpectType Decoder<number, unknown>
number; // $ExpectType Decoder<number, unknown>
positiveInteger; // $ExpectType Decoder<number, unknown>
positiveNumber; // $ExpectType Decoder<number, unknown>

string; // $ExpectType Decoder<string, unknown>
nonEmptyString; // $ExpectType Decoder<string, unknown>
email; // $ExpectType Decoder<string, unknown>
regex(/foo/, 'Must be foo'); // $ExpectType Decoder<string, unknown>
url; // $ExpectType Decoder<URL, unknown>
httpsUrl; // $ExpectType Decoder<URL, unknown>
uuid; // $ExpectType Decoder<string, unknown>
uuidv1; // $ExpectType Decoder<string, unknown>
uuidv4; // $ExpectType Decoder<string, unknown>

array(string); // $ExpectType Decoder<string[], unknown>
array(number); // $ExpectType Decoder<number[], unknown>
array(array(number)); // $ExpectType Decoder<number[][], unknown>
poja; // $ExpectType Decoder<unknown[], unknown>
nonEmptyArray(string); // $ExpectType Decoder<[string, ...string[]], unknown>
nonEmptyArray(number); // $ExpectType Decoder<[number, ...number[]], unknown>
set(string); // $ExpectType Decoder<Set<string>, unknown>
set(number); // $ExpectType Decoder<Set<number>, unknown>

tuple(string); // $ExpectType Decoder<[string], unknown>
tuple(string, number); // $ExpectType Decoder<[string, number], unknown>
tuple(string, string, number); // $ExpectType Decoder<[string, string, number], unknown>
tuple(string, string, number, string); // $ExpectType Decoder<[string, string, number, string], unknown>
tuple(string, string, number, string, number); // $ExpectType Decoder<[string, string, number, string, number], unknown>
tuple(string, string, number, string, number, string); // $ExpectType Decoder<[string, string, number, string, number, string], unknown>

// $ExpectType { name: string; tags: string[]; }
object({
    name: string,
    tags: array(string),
}).verify('dummy');

// Style argument
string.verify('dummy', formatInline);
string.verify('dummy', formatShort);

// $ExpectType Decoder<number, unknown>
compose(
    string,
    define((value: string) => ok(value.length)),
);

// $ExpectType Decoder<string, unknown>
predicate(string, (s) => s.startsWith('x'), 'Must start with x');

// $ExpectType Decoder<string, unknown>
predicate(unknown, (foo): foo is string => typeof foo === 'string', 'Is string');

// $ExpectType Decoder<"a" | "b", unknown>
predicate(
    string,
    (foo: string): foo is 'a' | 'b' => foo === 'a' || foo === 'b',
    'Is a or b',
);

prep(Number, string); // $ExpectType Decoder<string, unknown>
prep(String, string); // $ExpectType Decoder<string, unknown>
prep(Number, number); // $ExpectType Decoder<number, unknown>
prep(String, number); // $ExpectType Decoder<number, unknown>
prep(String, either(number, string)); // $ExpectType Decoder<string | number, unknown>
prep(Number, either(number, string)); // $ExpectType Decoder<string | number, unknown>

array(string); // $ExpectType Decoder<string[], unknown>
array(number); // $ExpectType Decoder<number[], unknown>
array(array(number)); // $ExpectType Decoder<number[][], unknown>
poja; // $ExpectType Decoder<unknown[], unknown>

boolean.verify('dummy'); // $ExpectType boolean
truthy.verify('dummy'); // $ExpectType boolean
numericBoolean.verify('dummy'); // $ExpectType boolean

optional(string); // $ExpectType Decoder<string | undefined, unknown>
optional(optional(string)); // $ExpectType Decoder<string | undefined, unknown>

nullable(string); // $ExpectType Decoder<string | null, unknown>
nullable(nullable(string)); // $ExpectType Decoder<string | null, unknown>

maybe(string); // $ExpectType Decoder<string | null | undefined, unknown>
maybe(maybe(string)); // $ExpectType Decoder<string | null | undefined, unknown>

// $ExpectType Decoder<{ bar: { qux: string; }; foo?: string | undefined; }, unknown>
object({
    foo: optional(string),
    bar: object({ qux: string }),
});

// $ExpectType Decoder<{ bar: { qux: string; }; foo?: string | undefined; }, unknown>
exact({
    foo: optional(string),
    bar: object({ qux: string }),
});

// $ExpectType Decoder<{ id: string; } & { [extra: string]: unknown; }, unknown>
inexact({ id: string });

// $ExpectType Decoder<{ [key: string]: unknown; }, unknown>
pojo;

// $ExpectType Decoder<Map<string, number>, unknown>
mapping(number);

// $ExpectType Decoder<{ [key: string]: number; }, unknown>
dict(number);

// $ExpectType Decoder<string, unknown>
lazy(() => string);

// $ExpectType Decoder<number, unknown>
lazy(() => number);

// $ExpectType JSONValue
json.verify('hi');

// $ExpectType JSONObject
jsonObject.verify({});

// $ExpectType JSONArray
jsonArray.verify([]);

// $ExpectType Decoder<Error, unknown>
instanceOf(Error);

// $ ExpectType Decoder<TypeError, unknown>
instanceOf(TypeError);

// $ExpectType Decoder<RegExp, unknown>
instanceOf(RegExp);

// $ExpectType Decoder<Promise<string>, unknown>
instanceOf<Promise<string>>(Promise);

// $ExpectError
instanceOf<Promise<string>>(Set);

// $ExpectType Decoder<Date, unknown>
date;

// $ExpectType Date
const d = iso8601.verify('dummy');
d.getFullYear();

fail('I will never return'); // $ExpectType Decoder<never, unknown>
never('I will never return'); // $ExpectType Decoder<never, unknown>

either(string, number); // $ExpectType Decoder<string | number, unknown>
either(string, string, number); // $ExpectType Decoder<string | number, unknown>
either(string, boolean, number, array(number)); // $ExpectType Decoder<string | number | boolean | number[], unknown>
either(string, string, string, string, string); // $ExpectType Decoder<string, unknown>
either(string, string, string, string, string, string); // $ExpectType Decoder<string, unknown>
either(string, string, string, string, string, string, string); // $ExpectType Decoder<string, unknown>
either(string, string, string, string, string, string, string, string); // $ExpectType Decoder<string, unknown>
either(string, string, string, string, string, string, string, string, string); // $ExpectType Decoder<string, unknown>

// $ExpectType Decoder<"foo" | "bar" | "qux", unknown>
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

// $ExpectType Decoder<Values<{ rect: Rect; circle: Circle; }>, unknown>
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

// $ExpectType Decoder<Values<{ 0: Rect1; 1: Circle1; }>, unknown>
taggedUnion('_type', { 0: rect1, 1: circle1 });

// $ExpectType Decoder<string, unknown>
string.describe('xxx');
// $ExpectType Decoder<number, unknown>
number.describe('xxx');
