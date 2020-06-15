import { lazy, string, number } from 'decoders';

// $ExpectType Decoder<string, unknown>
lazy(() => string);

// $ExpectType Decoder<number, unknown>
lazy(() => number);
