import { guard, object, string, array } from 'decoders';

// $ExpectType { name: string; tags: string[]; } & {}
guard(
    object({
        name: string,
        tags: array(string),
    })
)('dummy');

// Style argument
guard(string, { style: 'inline' });
guard(string, { style: 'simple' });
