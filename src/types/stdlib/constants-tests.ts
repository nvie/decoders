import { constant, hardcoded, mixed, null_, undefined_, unknown } from 'decoders';

constant('foo'); // $ExpectType Decoder<"foo", unknown>
hardcoded('foo'); // $ExpectType Decoder<"foo", unknown>

null_; // $ExpectType Decoder<null, unknown>
undefined_; // $ExpectType Decoder<undefined, unknown>
mixed; // $ExpectType Decoder<unknown, unknown>
unknown; // $ExpectType Decoder<unknown, unknown>
