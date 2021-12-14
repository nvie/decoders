import { exact, inexact, object, optional, pojo, string } from 'decoders';

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
