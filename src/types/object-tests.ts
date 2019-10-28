import { exact, object, pojo, string } from 'decoders';

// $ExpectType Decoder<{ foo: string; bar: { qux: string; } & {}; } & {}, unknown>
object({
    foo: string,
    bar: object({ qux: string }),
});

// $ExpectType Decoder<{ foo: string; bar: { qux: string; } & {}; } & {}, unknown>
exact({
    foo: string,
    bar: object({ qux: string }),
});

// $ExpectType Decoder<{ [key: string]: unknown; }, unknown>
pojo;
