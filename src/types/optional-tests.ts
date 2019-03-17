import { maybe, nullable, optional, string } from 'decoders';

optional(string); // $ExpectType Decoder<string | undefined, unknown>
optional(optional(string)); // $ExpectType Decoder<string | undefined, unknown>

nullable(string); // $ExpectType Decoder<string | null, unknown>
nullable(nullable(string)); // $ExpectType Decoder<string | null, unknown>

maybe(string); // $ExpectType Decoder<string | null | undefined, unknown>
maybe(maybe(string)); // $ExpectType Decoder<string | null | undefined, unknown>
