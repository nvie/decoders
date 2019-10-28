import { maybe, nullable, object, optional, string } from 'decoders';

optional(string); // $ExpectType OptionalDecoder<string, unknown>
optional(optional(string)); // $ExpectType OptionalDecoder<string, unknown>

nullable(string); // $ExpectType Decoder<string | null, unknown>
nullable(nullable(string)); // $ExpectType Decoder<string | null, unknown>

maybe(string); // $ExpectType OptionalDecoder<string | null, unknown>
maybe(maybe(string)); // $ExpectType OptionalDecoder<string | null, unknown>

object({ a: string, b: optional(string) }); // $ExpectType Decoder<{ a: string; } & { b?: string | undefined; }, unknown>
