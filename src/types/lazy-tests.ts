import { lazy, string, number } from 'decoders';

// $ExpectType Decoder<string>
lazy(() => string);

// $ExpectType Decoder<number>
lazy(() => number);
