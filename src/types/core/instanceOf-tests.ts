import { instanceOf } from 'decoders';

// $ExpectType Decoder<Error, unknown>
instanceOf(Error);

// $ ExpectType Decoder<TypeError, unknown>
instanceOf(TypeError);

// $ExpectType Decoder<RegExp, unknown>
instanceOf(RegExp);

// $ExpectType Decoder<Promise<string>, unknown>
instanceOf<Promise<string>>(Promise);

// $ExpectError
instanceOf<Promise<string>>(Set);
