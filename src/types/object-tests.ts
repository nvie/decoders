import { exact, object, optional, pojo, string } from 'decoders';

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

// $ExpectType Decoder<{ [key: string]: unknown; }, unknown>
pojo;
