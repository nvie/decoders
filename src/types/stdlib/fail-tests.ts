import { fail } from 'decoders';

// $ExpectType Decoder<never, unknown>
fail('I will never return');
