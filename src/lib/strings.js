// @flow strict

import { define } from '../Decoder';
import { either } from './unions';
import { instanceOf } from './utilities';
import type { Decoder } from '../Decoder';

/** Match groups in this regex:
 * \1 - the scheme
 * \2 - the username/password (optional)
 * \3 - the host
 * \4 - the port (optional)
 * \5 - the path (optional)
 */
const url_re =
    /^([A-Za-z]{3,9}(?:[+][A-Za-z]{3,9})?):\/\/(?:([-;:&=+$,\w]+)@)?(?:([A-Za-z0-9.-]+)(?::([0-9]{2,5}))?)(\/(?:[-+~%/.,\w]*)?(?:\?[-+=&;%@.,\w]*)?(?:#[.,!/\w]*)?)?$/;

/**
 * Accepts and returns strings.
 */
export const string: Decoder<string> = define((blob, ok, err) =>
    typeof blob === 'string' ? ok(blob) : err('Must be string'),
);

/**
 * Like `string`, but will reject the empty string or strings containing only whitespace.
 */
export const nonEmptyString: Decoder<string> = regex(/\S/, 'Must be non-empty string');

/**
 * Accepts and returns strings that match the given regular expression.
 */
export function regex(regex: RegExp, msg: string): Decoder<string> {
    return string.refine((s) => regex.test(s), msg);
}

/**
 * Accepts and returns strings that are syntactically valid email addresses.
 * (This will not mean that the email address actually exist.)
 */
export const email: Decoder<string> = regex(
    // The almost perfect email regex, taken from https://emailregex.com/
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    'Must be email',
);

/**
 * Accepts strings that are valid URLs, returns the value as a URL instance.
 */
export const url: Decoder<URL> = either(
    regex(url_re, 'Must be URL').transform((value) => new URL(value)),
    instanceOf(URL),
);

/**
 * Accepts strings that are valid URLs, but only HTTPS ones. Returns the value
 * as a URL instance.
 */
export const httpsUrl: Decoder<URL> = url.refine(
    (value) => value.protocol === 'https:',
    'Must be an HTTPS URL',
);

/**
 * Accepts strings that are valid
 * [UUIDs](https://en.wikipedia.org/wiki/universally_unique_identifier)
 * (universally unique identifier).
 */
export const uuid: Decoder<string> = regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    'Must be uuid',
);

/**
 * Like `uuid`, but only accepts
 * [UUIDv1](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_1_%28date-time_and_MAC_address%29)
 * strings.
 */
export const uuidv1: Decoder<string> =
    // https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_1_(date-time_and_MAC_address)
    uuid.refine((value) => value[14] === '1', 'Must be uuidv1');

/**
 * Like `uuid`, but only accepts
 * [UUIDv4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_%28random%29)
 * strings.
 */
export const uuidv4: Decoder<string> =
    // https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)
    uuid.refine((value) => value[14] === '4', 'Must be uuidv4');
