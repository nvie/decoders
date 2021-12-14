import { guard, date, iso8601 } from 'decoders';

// $ExpectType Decoder<Date, unknown>
date;

// $ExpectType Date
const d = guard(iso8601)('dummy');
d.getFullYear();
