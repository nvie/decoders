import { array, boolean, constant, either, either3, either4, number, oneOf, string } from 'decoders';

either(string, number); // $ExpectType Decoder<string | number, unknown>
either3(string, string, number); // $ExpectType Decoder<string | number, unknown>
either4(string, boolean, number, array(number)); // $ExpectType Decoder<string | number | boolean | number[], unknown>

// $ExpectType Decoder<string, unknown>
oneOf(['foo', 'bar', 'qux']);
