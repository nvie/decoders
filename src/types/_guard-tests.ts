import { array, guard, object, string } from 'decoders';
import { formatInline, formatShort } from 'decoders/format';

// $ExpectType { name: string; tags: string[]; }
guard(
    object({
        name: string,
        tags: array(string),
    }),
)('dummy');

// Style argument
guard(string, formatInline);
guard(string, formatShort);
