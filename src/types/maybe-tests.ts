import { maybe, string } from 'decoders';

maybe(string); // $ExpectType Decoder<string | null | undefined, unknown>
maybe(maybe(string)); // $ExpectType Decoder<string | null | undefined, unknown>
