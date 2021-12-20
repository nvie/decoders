// @flow strict

import { annotate } from '../annotate';
import { either } from './either';
import { err, ok } from '../result';
import { instanceOf } from './instanceOf';
import { map, predicate } from './composition';
import type { Decoder } from '../_types';

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
 * Decoder that only returns Ok for string inputs.  Err otherwise.
 */
export const string: Decoder<string> = (blob: mixed) => {
    return typeof blob === 'string' ? ok(blob) : err(annotate(blob, 'Must be string'));
};

/**
 * Decoder that only returns Ok for non-empty string inputs.  Err otherwise.
 */
export const nonEmptyString: Decoder<string> = regex(/\S/, 'Must be non-empty string');

/**
 * Decoder that only returns Ok for string inputs that match the regular
 * expression.  Err otherwise.  Will always validate that the input is a string
 * before testing the regex.
 */
export function regex(regex: RegExp, msg: string): Decoder<string> {
    return predicate(string, (s) => regex.test(s), msg);
}

/**
 * Decoder that only returns Ok for string inputs that match the almost perfect
 * email regex, taken from http://emailregex.com.  Err otherwise.
 */
export const email: Decoder<string> = regex(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    'Must be email',
);

export const url: Decoder<URL> = either(
    map(regex(url_re, 'Must be URL'), (value) => new URL(value)),
    instanceOf(URL),
);

export const httpsUrl: Decoder<URL> = predicate(
    url,
    (value) => value.protocol === 'https:',
    'Must be an HTTPS URL',
);
