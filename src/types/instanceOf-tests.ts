import { instanceOf } from 'decoders';

// $ExpectType Decoder<Error, unknown>
instanceOf(Error);

// $ExpectType Decoder<TypeError, unknown>
instanceOf(TypeError);
