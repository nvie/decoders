import { tuple2, tuple3, string, number } from 'decoders';

tuple2(string, number); // $ExpectType Decoder<[string, number], unknown>
tuple3(string, string, number); // $ExpectType Decoder<[string, string, number], unknown>
