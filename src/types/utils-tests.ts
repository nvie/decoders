import { compose, map, predicate, string } from 'decoders';

// $ExpectType Decoder<number, unknown>
map(string, parseFloat);

// $ExpectType Decoder<string, unknown>
compose(
    string,
    predicate(s => s.startsWith('x'), 'Must start with x')
);
