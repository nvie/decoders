// @flow strict

import { annotate } from 'debrief';
import { Err, Ok } from 'lemons/Result';

import type { Decoder } from './types';
import { compose, predicate } from './utils';

/** Match groups in this regex:
 * \1 - the scheme
 * \2 - the username/password (optional)
 * \3 - the host
 * \4 - the port (optional)
 * \5 - the path (optional)
 */
const url_re =
    /^([A-Za-z]{3,9}(?:[+][A-Za-z]{3,9})?):\/\/(?:([-;:&=+$,\w]+)@)?(?:([A-Za-z0-9.-]+)(?::([0-9]{2,5}))?)(\/(?:[-+~%/.,\w]*)?(?:\?[-+=&;%@.,\w]*)?(?:#[.,!/\w]*)?)?$/;

// The URL schemes the url() decoder accepts by default
const DEFAULT_SCHEMES = ['https'];

/**
 * Decoder that only returns Ok for string inputs.  Err otherwise.
 */
export const string: Decoder<string> = (blob: mixed) => {
    return typeof blob === 'string' ? Ok(blob) : Err(annotate(blob, 'Must be string'));
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
    return compose(
        string,
        predicate((s) => regex.test(s), msg)
    );
}

/**
 * Decoder that only returns Ok for string inputs that match the almost perfect
 * email regex, taken from http://emailregex.com.  Err otherwise.
 */
export const email: Decoder<string> = regex(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    'Must be email'
);

/**
 * Decoder that only returns Ok for string inputs that match URLs of the
 * expected scheme.  Defaults to only accept HTTPS URLs.  Err otherwise.
 *
 * Variants that can be used:
 *
 * - url()                      accepts only https:// URLs
 * - url([])                    accepts any URL scheme
 * - url(['http'])              accepts only HTTP
 * - url(['https', 'git+ssh'])  accepts both https:// and git+ssh:// URLs
 */
export const url = (schemes: $ReadOnlyArray<string> = DEFAULT_SCHEMES): Decoder<string> =>
    compose(string, (value: string) => {
        const matches = value.match(url_re);
        if (!matches) {
            return Err(annotate(value, 'Must be URL'));
        } else {
            const scheme = matches[1];
            if (schemes.length === 0 || schemes.includes(scheme.toLowerCase())) {
                return Ok(value);
            } else {
                return Err(
                    annotate(value, `URL scheme must be any of: ${schemes.join(', ')}`)
                );
            }
        }
    });
