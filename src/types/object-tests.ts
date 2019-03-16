import { object, string } from 'decoders';

// $ExpectType Decoder<{ foo: string; bar: { qux: string; }; }, unknown>
object({
    foo: string,
    bar: object({ qux: string }),
});
