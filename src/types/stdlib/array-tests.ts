import { array, guard, number, poja, string } from 'decoders';

array(string); // $ExpectType Decoder<string[], unknown>
array(number); // $ExpectType Decoder<number[], unknown>
array(array(number)); // $ExpectType Decoder<number[][], unknown>
poja; // $ExpectType Decoder<unknown[], unknown>
