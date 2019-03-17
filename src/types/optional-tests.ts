import { optional, string } from 'decoders';

optional(string); // $ExpectType Decoder<string | undefined, unknown>
optional(optional(string)); // $ExpectType Decoder<string | undefined, unknown>
