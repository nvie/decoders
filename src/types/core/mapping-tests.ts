import { dict, mapping, number } from 'decoders';

// $ExpectType Decoder<Map<string, number>, unknown>
mapping(number);

// $ExpectType Decoder<{ [key: string]: number; }, unknown>
dict(number);
