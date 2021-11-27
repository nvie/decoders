import { email, regex, string, url } from 'decoders';

string; // $ExpectType Decoder<string, unknown>
email; // $ExpectType Decoder<string, unknown>
regex(/foo/, 'Must be foo'); // $ExpectType Decoder<string, unknown>
url(); // $ExpectType Decoder<string, unknown>
