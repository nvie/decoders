import { guard, boolean, truthy, numericBoolean } from 'decoders';

guard(boolean)('dummy'); // $ExpectType boolean
guard(truthy)('dummy'); // $ExpectType boolean
guard(numericBoolean)('dummy'); // $ExpectType boolean
