import { compose, map, predicate, string } from 'decoders';

// $ExpectType Decoder<number, unknown>
map(string, parseFloat);

// $ExpectType Decoder<string, unknown>
compose(
    string,
    predicate((s) => s.startsWith('x'), 'Must start with x')
);

const a = predicate((foo): foo is string => typeof foo === 'string', 'Is string');
// $ExpectType Decoder<string, unknown>
a;

const b = predicate(
    (foo: string): foo is 'a' | 'b' => foo === 'a' || foo === 'b',
    'Is a or b'
);
// $ExpectType Decoder<"a" | "b", string>
b;

// $ExpectType Decoder<"a" | "b", unknown>
compose(a, b);
