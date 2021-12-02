import { integer, number, positiveInteger, positiveNumber } from 'decoders';

integer; // $ExpectType Decoder<number, unknown>
number; // $ExpectType Decoder<number, unknown>
positiveInteger; // $ExpectType Decoder<number, unknown>
positiveNumber; // $ExpectType Decoder<number, unknown>
