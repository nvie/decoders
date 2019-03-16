import { constant, hardcoded, mixed, null_, undefined_, unknown } from 'decoders';

constant('foo' as 'foo'); // $ExpectType Decoder<"foo", unknown>
// NOTE!       ^^^^^^^^
//             This should _NOT_ be necessary!
//             I want to get rid of this, but I'm not sure how to!

hardcoded('foo' as 'foo'); // $ExpectType Decoder<"foo", unknown>
// NOTE!        ^^^^^^^^
//              This should _NOT_ be necessary!
//              I want to get rid of this, but I'm not sure how to!

null_; // $ExpectType Decoder<null, unknown>
undefined_; // $ExpectType Decoder<undefined, unknown>
mixed; // $ExpectType Decoder<unknown, unknown>
unknown; // $ExpectType Decoder<unknown, unknown>
